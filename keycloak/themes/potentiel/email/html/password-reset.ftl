<#import "email-template.ftl" as layout>
<@layout.emailLayout ; section>
    <#if section = "title">
      Potentiel - Récupération de mot de passe
    <#elseif section = "intro">
      Nous avons reçu une demande de récupération de mot de passe pour le site Potentiel pour cette adresse électronique. Si vous avez bien effectué cette demande, vous pouvez changer de mot de passe en cliquant sur le lien ci-dessous:
    <#elseif section = "actionButton">
      <a href="${link}" style="display:inline-block;background:#1c38b0;color:#ffffff;font-family:Arial, sans-serif;font-size:14px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px 10px 25px;mso-padding-alt:0px;border-radius:3px;" target="_blank"><span style="font-size:14px;">Choisir un nouveau mot de passe</span></a>
    <#elseif section = "outro">
      <p class="text-build-content" data-testid="I0ETIbJm4" style="margin: 10px 0; margin-top: 10px;"><b>Si vous n'avez pas effectué cette demande, vous pouvez ignorer ce message.</b></p>
      <p class="text-build-content" data-testid="I0ETIbJm4" style="margin: 10px 0; margin-top: 10px;">Ce lien expire dans ${linkExpirationFormatter(linkExpiration)}.</p>
    </#if>
</@layout.emailLayout>