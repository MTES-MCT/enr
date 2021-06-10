<#import "email-template.ftl" as layout>
<@layout.emailLayout ; section>
    <#if section = "title">
      Potentiel - Invitation à créer un compte
    <#elseif section = "intro">
      Nous vous invitons à créer un compte sur l'outil Potentiel pour suivre les projets lauréats d'appels d'offres photovoltaïques et éoliens:
    <#elseif section = "actionButton">
      <a href="${link}" style="display:inline-block;background:#1c38b0;color:#ffffff;font-family:Arial, sans-serif;font-size:14px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px 10px 25px;mso-padding-alt:0px;border-radius:3px;" target="_blank"><span style="font-size:14px;">Créer mon compte</span></a>
    <#elseif section = "outro">
      <p class="text-build-content" data-testid="I0ETIbJm4" style="margin: 10px 0; margin-top: 10px;">Cette invitation expire dans ${linkExpirationFormatter(linkExpiration)}.</p>
    </#if>
</@layout.emailLayout>