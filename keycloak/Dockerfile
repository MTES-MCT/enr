FROM jboss/keycloak

COPY keycloak/themes/potentiel/ /opt/jboss/keycloak/themes/potentiel/
COPY keycloak/configuration/standalone.xml /opt/jboss/keycloak/standalone/configuration/

CMD /opt/jboss/keycloak/bin/add-user-keycloak.sh -u $KEYCLOAK_USER -p $KEYCLOAK_PASSWORD

CMD ["-b", "0.0.0.0"]