<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">

    <#elseif section = "form">
    <div id="kc-form">
      <div id="kc-form-wrapper">
        <#if realm.password>
            <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                <#if message?has_content>
                    <#if message.type == 'error'>
                    <div class="notification error">${kcSanitize(message.summary)?no_esc}</div>
                    <#elseif message.type == 'warning'>
                    <div class="notification warning">${kcSanitize(message.summary)?no_esc}</div>
                    <#else>
                    <div class="notification success">${kcSanitize(message.summary)?no_esc}</div>
                    </#if>
                </#if>
                <div class="${properties.kcFormGroupClass!} form__group">
                    <label for="username" class="${properties.kcLabelClass!}">Courrier électronique</label>

                    <#if usernameEditDisabled??>
                        <input tabindex="1" id="username" class="${properties.kcInputClass!}" name="username" value="${(login.username!'')}" type="text" disabled />
                    <#else>
                        <input tabindex="1" id="username" class="${properties.kcInputClass!}" name="username" value="${(login.username!'')}"  type="text" autofocus autocomplete="off"
                               aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                        />
                    </#if>
                </div>

                <div class="${properties.kcFormGroupClass!}">
                    <label for="password" class="${properties.kcLabelClass!}">Mot de passe</label>

                    <input tabindex="2" id="password" class="${properties.kcInputClass!}" name="password" type="password" autocomplete="off"
                           aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                    />
                </div>

                <div class="${properties.kcFormGroupClass!} ${properties.kcFormSettingClass!}">
                    <div id="kc-form-options">
                        <#if realm.rememberMe && !usernameEditDisabled??>
                            <div class="checkbox">
                                <label>
                                    <#if login.rememberMe??>
                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked> ${msg("rememberMe")}
                                    <#else>
                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"> ${msg("rememberMe")}
                                    </#if>
                                </label>
                            </div>
                        </#if>
                        </div>

                  </div>

                  <div id="kc-form-buttons form__group" class="${properties.kcFormGroupClass!}">
                      <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                      <button tabindex="4" class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!} button" name="login" id="kc-login" type="submit">Je m'identifie</button>
                      <#if realm.resetPasswordAllowed>
                        <a tabindex="5" href="${url.loginResetCredentialsUrl}">Mot de passe oublié</a>
                    </#if>
                  </div>
            </form>
        </#if>
        </div>

    </div>
    <#elseif section = "info" >
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div id="kc-registration-container">
                <div id="kc-registration">
                    <span>${msg("noAccount")} <a tabindex="6"
                                                 href="${url.registrationUrl}">${msg("doRegister")}</a></span>
                </div>
            </div>
        </#if>
    </#if>

</@layout.registrationLayout>
