/**
 * The two legal pages Discord asks for as public URLs when an app requests
 * OAuth scopes (and that Epic's Brand Review asks for too). They live at
 * /terms and /privacy, and a moderator edits them from the dashboard.
 *
 * The defaults below are real, usable text - a blank legal page is worse than
 * none - written for what this site actually does: Discord sign-in, an Epic
 * name typed by the player, and the drop-spot map.
 */

export const SITE_PAGE_SLUGS = ["terms", "privacy"] as const;
export type SitePageSlug = (typeof SITE_PAGE_SLUGS)[number];

export const isSitePageSlug = (v: string): v is SitePageSlug =>
    (SITE_PAGE_SLUGS as readonly string[]).includes(v);

interface Seed {
    title: { es: string; pt: string };
    content: { es: string; pt: string };
}

const TERMS_ES = `<h2>1. Qué es Major Scrims</h2>
<p>Major Scrims es una comunidad de Fortnite que organiza scrims y torneos, publica un leaderboard y ofrece un mapa de spots para que los equipos clasificados marquen dónde van a caer. El sitio se usa junto con nuestro servidor de Discord.</p>

<h2>2. Cuenta y acceso</h2>
<p>Para usar las funciones que requieren identificarte iniciás sesión con tu cuenta de Discord. Sos responsable de la actividad de tu cuenta. Podemos suspender el acceso de quien haga trampa, moleste a otros jugadores, intente romper el sitio o incumpla las reglas de la comunidad.</p>

<h2>3. Torneos y spots</h2>
<p>Quién puede marcar un spot lo deciden los moderadores de cada torneo, ya sea por un rol de Discord o por una lista de clasificados. Marcar un spot no garantiza ningún resultado ni premio: los premios y las reglas de cada torneo se anuncian en el torneo y pueden cambiar. Los moderadores pueden liberar o reasignar un spot cuando hay una disputa.</p>

<h2>4. Uso aceptable</h2>
<p>No está permitido usar bots o scripts contra el sitio, marcar spots en nombre de otro sin su permiso, suplantar identidades, ni intentar acceder a partes del sitio que no te corresponden.</p>

<h2>5. Contenido</h2>
<p>Los nombres, marcas e imágenes de Fortnite pertenecen a Epic Games. Major Scrims no está asociado ni respaldado por Epic Games. El resto del contenido del sitio es de Major Scrims.</p>

<h2>6. Sin garantías</h2>
<p>El sitio se ofrece tal cual está. Hacemos lo posible para que funcione bien, pero no garantizamos que esté siempre disponible ni libre de errores.</p>

<h2>7. Cambios</h2>
<p>Podemos actualizar estos términos. La versión vigente es siempre la publicada en esta página.</p>

<h2>8. Contacto</h2>
<p>Cualquier consulta la podés hacer en nuestro Discord.</p>`;

const TERMS_PT = `<h2>1. O que é a Major Scrims</h2>
<p>A Major Scrims é uma comunidade de Fortnite que organiza scrims e torneios, publica um leaderboard e oferece um mapa de spots para que as equipes classificadas marquem onde vão cair. O site é usado junto com o nosso servidor do Discord.</p>

<h2>2. Conta e acesso</h2>
<p>Para usar as funções que exigem identificação, você entra com a sua conta do Discord. Você é responsável pela atividade da sua conta. Podemos suspender o acesso de quem trapacear, incomodar outros jogadores, tentar quebrar o site ou descumprir as regras da comunidade.</p>

<h2>3. Torneios e spots</h2>
<p>Quem pode marcar um spot é decidido pelos moderadores de cada torneio, seja por um cargo do Discord ou por uma lista de classificados. Marcar um spot não garante nenhum resultado nem prêmio: os prêmios e as regras de cada torneio são anunciados no torneio e podem mudar. Os moderadores podem liberar ou remanejar um spot quando há disputa.</p>

<h2>4. Uso aceitável</h2>
<p>Não é permitido usar bots ou scripts contra o site, marcar spots em nome de outra pessoa sem permissão, se passar por outra pessoa, nem tentar acessar partes do site que não são suas.</p>

<h2>5. Conteúdo</h2>
<p>Os nomes, marcas e imagens de Fortnite pertencem à Epic Games. A Major Scrims não é associada nem endossada pela Epic Games. O restante do conteúdo do site é da Major Scrims.</p>

<h2>6. Sem garantias</h2>
<p>O site é oferecido como está. Fazemos o possível para que funcione bem, mas não garantimos que esteja sempre disponível nem livre de erros.</p>

<h2>7. Alterações</h2>
<p>Podemos atualizar estes termos. A versão vigente é sempre a publicada nesta página.</p>

<h2>8. Contato</h2>
<p>Qualquer dúvida pode ser feita no nosso Discord.</p>`;

const PRIVACY_ES = `<h2>1. Qué datos guardamos</h2>
<p>Cuando iniciás sesión con Discord guardamos tu ID de Discord, tu nombre de usuario, tu avatar y los roles que tenés en el servidor de Major Scrims. Si cargás tu nombre de Epic, también lo guardamos. Cuando marcás un spot guardamos qué spot elegiste, en qué torneo y con qué compañeros.</p>

<h2>2. Para qué los usamos</h2>
<p>Únicamente para que el sitio funcione: identificarte, saber si clasificaste a un torneo, mostrar tu equipo en el mapa y que los moderadores puedan organizar los torneos. No usamos tus datos para publicidad.</p>

<h2>3. Por qué leemos tus roles de Discord</h2>
<p>Los moderadores crean un rol por torneo para los clasificados. Leemos la lista de roles que tenés en el servidor de Major Scrims para saber si podés marcar un spot. No leemos tus mensajes, ni tus otros servidores, ni nada más de tu cuenta.</p>

<h2>4. Con quién los compartimos</h2>
<p>Con nadie. No vendemos ni cedemos datos a terceros. Lo único que es público en el sitio es lo que vos elegís mostrar: tu nombre de Epic y tu equipo en el mapa de spots del torneo en el que participás.</p>

<h2>5. Dónde se guardan</h2>
<p>En nuestra base de datos, en servidores de nuestros proveedores de hosting. Tomamos medidas razonables para protegerlos.</p>

<h2>6. Cuánto tiempo</h2>
<p>Mientras uses el sitio. Si querés que borremos tu cuenta y tus datos, escribinos por Discord y lo hacemos.</p>

<h2>7. Tus derechos</h2>
<p>Podés pedirnos acceder, corregir o borrar tus datos en cualquier momento. También podés dejar de usar el sitio y revocar el acceso de la aplicación desde la configuración de tu cuenta de Discord.</p>

<h2>8. Contacto</h2>
<p>Escribinos por nuestro Discord para cualquier tema de privacidad.</p>`;

const PRIVACY_PT = `<h2>1. Quais dados guardamos</h2>
<p>Quando você entra com o Discord, guardamos o seu ID do Discord, o seu nome de usuário, o seu avatar e os cargos que você tem no servidor da Major Scrims. Se você preencher o seu nome da Epic, também guardamos. Quando você marca um spot, guardamos qual spot escolheu, em qual torneio e com quais companheiros.</p>

<h2>2. Para que os usamos</h2>
<p>Somente para o site funcionar: identificar você, saber se você se classificou para um torneio, mostrar o seu time no mapa e permitir que os moderadores organizem os torneios. Não usamos os seus dados para publicidade.</p>

<h2>3. Por que lemos os seus cargos do Discord</h2>
<p>Os moderadores criam um cargo por torneio para os classificados. Lemos a lista de cargos que você tem no servidor da Major Scrims para saber se você pode marcar um spot. Não lemos as suas mensagens, nem os seus outros servidores, nem mais nada da sua conta.</p>

<h2>4. Com quem compartilhamos</h2>
<p>Com ninguém. Não vendemos nem cedemos dados a terceiros. O único que é público no site é o que você escolhe mostrar: o seu nome da Epic e o seu time no mapa de spots do torneio em que participa.</p>

<h2>5. Onde ficam guardados</h2>
<p>No nosso banco de dados, em servidores dos nossos provedores de hospedagem. Tomamos medidas razoáveis para protegê-los.</p>

<h2>6. Por quanto tempo</h2>
<p>Enquanto você usar o site. Se quiser que apaguemos a sua conta e os seus dados, fale conosco pelo Discord e fazemos isso.</p>

<h2>7. Os seus direitos</h2>
<p>Você pode pedir para acessar, corrigir ou apagar os seus dados a qualquer momento. Também pode parar de usar o site e revogar o acesso do aplicativo nas configurações da sua conta do Discord.</p>

<h2>8. Contato</h2>
<p>Fale conosco pelo nosso Discord para qualquer assunto de privacidade.</p>`;

export const SITE_PAGE_SEEDS: Record<SitePageSlug, Seed> = {
    terms: {
        title: { es: "Términos del servicio", pt: "Termos de serviço" },
        content: { es: TERMS_ES, pt: TERMS_PT },
    },
    privacy: {
        title: { es: "Política de privacidad", pt: "Política de privacidade" },
        content: { es: PRIVACY_ES, pt: PRIVACY_PT },
    },
};
