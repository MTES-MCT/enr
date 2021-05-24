FROM jboss/keycloak

COPY themes/potentiel/ /opt/jboss/keycloak/themes/potentiel/

CMD /opt/jboss/keycloak/bin/add-user-keycloak.sh -u $KEYCLOAK_USER -p $KEYCLOAK_PASSWORD

CMD ["-b", "0.0.0.0"]