import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const API_KEY = '9be2d815df09018b59e55a220b1a376e9b10608df5cf4a89f214d154abfae376';
const API_URL = 'https://prod.api-fortnite.com/api/v1/events/global';

// Simple in-memory cache
let cachedData: { timestamp: number; data: Tournament[] } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export interface Tournament {
    title: string;
    start: string;
    end: string;
    mode: string;
    teamSize: string;
    region: string;
    status: 'Upcoming' | 'Live' | 'Completed';
    poster: string;
}

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Check in-memory cache first
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
            return NextResponse.json(cachedData.data);
        }

        let rawData = null;

        // 2. Try fetching from API
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch(API_URL, {
                headers: { 'x-api-key': API_KEY },
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                rawData = await response.json();
            } else {
                console.warn(`API Error: ${response.status} ${response.statusText}. Using fallback.`);
            }
        } catch (fetchError) {
            console.warn('API Fetch failed or timed out. Using fallback.', fetchError);
        }

        // 3. Fallback to local JSON if API failed
        if (!rawData) {
            try {
                const filePath = path.join(process.cwd(), 'tournaments.json');
                const fileContent = await fs.readFile(filePath, 'utf-8');
                rawData = JSON.parse(fileContent);
                console.log('Loaded data from local fallback file.');
            } catch (fileError) {
                console.error('Failed to load fallback data:', fileError);
                return NextResponse.json({ error: 'Failed to Fetch Tournaments' }, { status: 500 });
            }
        }

        // 4. Normalize Data
        const tournaments: Tournament[] = [];
        const now = new Date();

        if (Array.isArray(rawData)) {
            rawData.forEach((group: any) => {
                if (group.regions && group.regions.BR) {
                    const brEvents = group.regions.BR;
                    brEvents.forEach((event: any) => {
                        const startDate = new Date(event.beginTime);
                        const endDate = new Date(event.endTime);

                        let status: 'Upcoming' | 'Live' | 'Completed' = 'Upcoming';
                        if (now > endDate) {
                            status = 'Completed';
                        } else if (now >= startDate && now <= endDate) {
                            status = 'Live';
                        }

                        // Determine Mode and Team Size
                        const nameLower = (group.name || '').toLowerCase();
                        const idLower = (event.eventId || '').toLowerCase();

                        let mode = 'Build';
                        if (nameLower.includes('zero build') || idLower.includes('zb')) {
                            mode = 'Zero Build';
                        } else if (nameLower.includes('reload')) {
                            mode = 'Reload';
                        }

                        let teamSize = 'Solo';
                        if (nameLower.includes('duo') || idLower.includes('duo')) {
                            teamSize = 'Duos';
                        } else if (nameLower.includes('trio') || idLower.includes('trio')) {
                            teamSize = 'Trios';
                        } else if (nameLower.includes('squad') || idLower.includes('squad')) {
                            teamSize = 'Squads';
                        }

                        tournaments.push({
                            title: group.name || event.name || 'Tournament',
                            start: event.beginTime,
                            end: event.endTime,
                            mode,
                            teamSize,
                            region: 'BR',
                            status,
                            poster: group.poster || event.poster || '',
                        });
                    });
                }
            });
        }

        // 5. Sort
        tournaments.sort((a, b) => {
            if (a.status === 'Live' && b.status !== 'Live') return -1;
            if (a.status !== 'Live' && b.status === 'Live') return 1;
            if (a.status === 'Upcoming' && b.status === 'Upcoming') {
                return new Date(a.start).getTime() - new Date(b.start).getTime();
            }
            return new Date(b.end).getTime() - new Date(a.end).getTime();
        });

        // 6. Update Cache
        cachedData = {
            timestamp: Date.now(),
            data: tournaments
        };

        return NextResponse.json(tournaments);

    } catch (error) {
        console.error('Critical Error in Tournaments API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
