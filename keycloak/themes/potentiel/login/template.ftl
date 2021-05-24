<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false showAnotherWayIfPresent=true>
<!DOCTYPE html>
<html itemscope itemtype="http://schema.org/WebPage" lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, nofollow">

    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Potentiel - Suivi des Projets d'Energies Renouvelables</title>

    <link href="${url.resourcesPath}/css/main.min.css" rel="stylesheet" />
    <link href="${url.resourcesPath}/css/potentiel.css" rel="stylesheet" />

    <!-- Favicons -->
    <meta name="theme-color" content="#ffffff" />
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="${url.resourcesPath}/img/favicons/apple-icon-180x180.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href="${url.resourcesPath}/img/favicons/favicon-16x16.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="${url.resourcesPath}/img/favicons/favicon-32x32.png"
    />
    <link rel="manifest" href="${url.resourcesPath}/img/favicons/manifest.json" />
    <link
      rel="mask-icon"
      href="${url.resourcesPath}/img/favicons/safari-pinned-tab.svg"
      color="#5bbad5"
    />
  </head>

  <body>
    <svg aria-hidden="true" focusable="false" style="display:none">
      <defs>
      <symbol
          viewBox="0 0 32 32"
          fill-rule="evenodd"
          clip-rule="evenodd"
          stroke-linejoin="round"
          stroke-miterlimit="1.414"
          id="expand"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            style="
              stroke: none;
              fill-rule: nonzero;
              fill: rgb(0%, 0%, 0%);
              fill-opacity: 1;
            "
            d="M 28.265625 6.132812 L 16 18.398438 L 3.734375 6.132812 L 0 9.867188 L 16 25.867188 L 32 9.867188 Z M 28.265625 6.132812 "
          />
        </symbol>
        <symbol
          id="building"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          ></path>
        </symbol>
        <symbol
          id="user-circle"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </symbol>
        <symbol
          id="cog"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          ></path>
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </symbol>
        <symbol
          id="clipboard-check"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
        </symbol>
        <symbol
          id="dots-vertical"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          ></path>
        </symbol>
      </defs>
    </svg>
<header class="navbar" role="navigation"><div class="navbar__container"><a class="navbar__home" href="/"><img class="navbar__logo" src="${url.resourcesPath}/img/logo-marianne.svg" alt="potentiel.beta.gouv.fr"/><span class="navbar__domain">potentiel.<b>beta.gouv</b><i>.fr</i></span></a><nav></nav></div></header><main role="main"><section class="section section-grey"><div class="container">

<#nested "form">

</div></section></main><footer class="footer" role="contentinfo"><div class="container"><ul class="footer__links"><li><img style="max-width:100%" src="${url.resourcesPath}/img/MIN_Transition_Ecologique_RVB_petit.png" alt="Logo du ministère de la transition énergétique" width="300" height="215"/></li><li><a href="https://docs.potentiel.beta.gouv.fr/info/cgu">Mentions Légales et Conditions Générales d‘Utilisation</a></li><li><a href="https://docs.potentiel.beta.gouv.fr/info/guide-dutilisation-potentiel">Guide d‘utilisation</a></li><li><a href="https://docs.potentiel.beta.gouv.fr/info/cgu#cookies">Notre politique de cookies</a></li></ul><div>2.34.0</div></div></footer>
  </body>
</html>
</#macro>
