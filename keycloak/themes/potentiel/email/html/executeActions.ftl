<#import "email-template.ftl" as layout>
<@layout.emailLayout ; section>
    <#if section = "title">
      Potentiel - Invitation à changer de mot de passe
    <#elseif section = "intro">
      Dans une démarche de renforcement de la sécurité de Potentiel, nous vous prions de bien vouloir choisir un nouveau mot de passe. Pour cela, cliquez sur le lien ci-dessous:
    <#elseif section = "actionButton">
      <a href="${link}" style="display:inline-block;background:#1c38b0;color:#ffffff;font-family:Arial, sans-serif;font-size:14px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px 10px 25px;mso-padding-alt:0px;border-radius:3px;" target="_blank"><span style="font-size:14px;">Mettre à jour mon mot de passe</span></a>
    <#elseif section = "outro">
      <p class="text-build-content" data-testid="I0ETIbJm4" style="margin: 10px 0; margin-top: 10px;">Ce lien expire dans ${linkExpirationFormatter(linkExpiration)}.</p>
      <p class="text-build-content" data-testid="I0ETIbJm4" style="margin: 10px 0; margin-top: 10px;">Si vous ne parvenez pas à utiliser ce lien à temps, vous pourrez utiliser lien "mot de passe oublié" présent sur la page d'identification.</p>
    </#if>
</@layout.emailLayout>