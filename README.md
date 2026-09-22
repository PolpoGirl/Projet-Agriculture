# Projet-integrateur
By Groupe 6 
-------------------------------------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------------------
# Table des matières

1. [Introduction et périmètre du document](#1-introduction-et-périmètre-du-document)
    - 1.1 Objet du document
    - 1.2 Portée du projet
2. [Description générale du système](#2-description-générale-du-système)
    - 2.1 Contexte
    - 2.2 Vue d'ensemble de l'architecture
    - 2.3 Périmètre fonctionnel couvert
    - 2.4 Contraintes générales
3. [Exigences fonctionnelles](#3-exigences-fonctionnelles)
    - 3.1 Module IoT - Capteurs et actionneurs
    - 3.2 Module microcontrôleur — ESP32
    - 3.3 Application web d'exploitation (AE)
    - 3.4 Application d'automatisation — CLI (AA)
4. [Stack technologique retenue](#4-stack-technologique-retenue)
    - 4.1 Base de données - PostgreSQL
    - 4.2 Back-end - Django et Django REST Framework
    - 4.3 Front-end - React
5. [Protocoles de communication](#5-protocoles-de-communication)
    - 5.1 MQTT — Collecte des données capteurs
    - 5.2 HTTP — Communication entre l'ESP32 et l'application web
6. [How to run](#6-How to run)
    - 6.1 CMD — Comment faire tourner le serveur

---

# Introduction et périmètre du document
## 1.1 Objet du document
Ce document constitue des spécification et exigences du projet Agriculture intelligente, développé dans le cadre du projet integrateur de l'Institut Ucac-Icam. Il a pour vocation de servir de référence commune à l'ensemble des six membres du groupe tout au long du cycle de développement, en posant de manière explicite et structurée l'ensemble des besoins fonctionnels, non fonctionnels et techniques identifiés.

## 1.2 Portée du projet
Le projet Agriculture intelligente vise à concevoir et à réaliser un prototype de système de gestion agricole connecté, reposant sur trois composantes interdépendantes : • Un système IoT composé de capteurs environnementaux et d'actionneurs, piloté par un microcontrôleur ESP32. • Une application web d'exploitation (AE) permettant la visualisation des données, la gestion des alertes et le déclenchement d'actions manuelles ou automatiques. • Une application d'automatisation (AA) sous forme de script en ligne de commande (CLI/batch) pour l'exécution d'actions en masse sans interaction directe avec l'interface web.

# Description générale du système
## 2.1 Contexte
L'agriculture moderne fait face à des défis croissants : pression climatique, nécessité d'optimisation des ressources naturelles et besoin d'automatisation des tâches répétitives. Le prototype Agriculture intelligente répond à ces enjeux en proposant une solution intégrée permettant une surveillance continue des paramètres environnementaux d'une exploitation agricole, couplée à une capacité d'intervention automatisée ou manuelle sur les équipements de terrain.
## 2.2 Vue d'ensemble de l'architecture
Le système repose sur trois couches distinctes et communicantes :

| Couche | Composants | Rôle |
|--------|------------|------|
| Couche 1 Terrain | Capteurs (YL-69, DHT22, BH1750, SEN0159, capteur de niveau d'eau) + Actionneurs (pompe, ventilation, éclairage) | Collecte des données environnementales et exécution des actions physiques. |
| Couche 2 Contrôle | Microcontrôleur ESP32 | Centralisation, traitement local et transmission des données. Pilotage des actionneurs selon les seuils définis. |
| Couche 3 Application | Application web (AE) + Application CLI (AA) + Base de données centralisée | Interface utilisateur, stockage de l'historique, logique applicative, alertes et supervision. |

## 2.3 Périmètre fonctionnel couvert
• Surveillance en temps réel de l'humidité du sol, de la température ambiante, du taux de CO2, de la luminosité et du niveau du réservoir d'eau. • Automatisation des actions d'irrigation, de ventilation et d'éclairage selon des seuils configurables. • Visualisation centralisée des données et de l'historique via un tableau de bord web. • Gestion des accès utilisateurs avec deux niveaux de privilèges distincts (consultation, modification). • Envoi d'alertes en cas de dépassement de seuil. • Export de l'historique des actions et mesures. • Exécution d'actions en masse via interface en ligne de commande.

## 2.4 Contraintes générales
• Le prototype doit être fonctionnel dans un environnement réseau local Wi-Fi. • L'application web doit être accessible sur ordinateur, tablette et mobile (design responsive). • L'application doit être disponible en français et en anglais. • Les mots de passe utilisateurs doivent être chiffrés en base de données. • Les communications entre l'ESP32 et le serveur doivent emprunter un protocole sécurisé. • Chaque exécution du script CLI doit être enregistrée dans un fichier de journalisation (log).

# 3. Exigences fonctionnelles
## 3.1 Module IoT - Capteurs et actionneurs
### 3.1.1 Capteurs
Le tableau suivant recense les capteurs retenus, leurs grandeurs mesurées et leurs rôles dans le système :

| Identifiant | Capteur | Grandeur mesurée | Rôle dans le système |
|-------------|---------|------------------|----------------------|
| S-01 | YL-69 | Humidité du sol | Déclenchement de l'irrigation automatique lorsque le seuil minimal est atteint. |
| S-02 | DHT22 | Température et humidité ambiante | Surveillance climatique, déclenchement de la ventilation, génération d'alertes thermiques. |
| S-03 | BH1750 | Luminosité (lux) | Vérification de l'exposition lumineuse, déclenchement de l'éclairage artificiel. |
| S-04 | SEN0159 + booster 6V | Concentration de CO2 | Détection d'un taux de CO2 anormal, déclenchement de la ventilation. |
| S-05 | Capteur de niveau d'eau | Niveau du réservoir | Détection d'un niveau critique, génération d'une alerte de remplissage. |

### 3.1.2 Actionneurs

| Identifiant | Actionneur | Condition de déclenchement |
|-------------|------------|----------------------------|
| A-01 | Pompe d'irrigation (relais 5V) | Humidité du sol (S-01) inférieure au seuil minimal défini. Arrêt automatique au retour à un niveau optimal. |
| A-02 | Système de ventilation | Température (S-02) supérieure au seuil critique OU taux de CO2 (S-04) supérieur au seuil de sécurité. |
| A-03 | Éclairage artificiel | Luminosité (S-03) inférieure au seuil défini pendant une durée prolongée OU période nocturne configurée. |

## 3.2 Module microcontrôleur — ESP32
L'ESP32 constitue le pivot central du système IoT. Il a la charge des fonctions suivantes : 
    • Acquisition périodique des données issues de l'ensemble des capteurs.
    • Évaluation des valeurs collectées au regard des seuils configurés. 
    • Pilotage direct des actionneurs en cas de dépassement de seuil. 
    • Transmission des données vers le serveur applicatif via MQTT. 
    • Réception des commandes manuelles émises par l'application web via HTTP.

L'ESP32 a été retenu pour ses caractéristiques techniques particulièrement adaptées au projet : 
    • Connectivité Wi-Fi 802.11 b/g/n intégrée, permettant une communication sans fil fiable en environnement local. 
    • Double cœur Xtensa LX6 à 240 MHz, offrant la capacité de traiter simultanément la collecte des données et la gestion des communications réseau. 
    • Faible consommation énergétique, compatible avec un déploiement sur site agricole. 
    • Compatibilité avec les bibliothèques Arduino et MicroPython, facilitant le développement et le débogage.

## 3.3 Application web d'exploitation (AE)
### 3.3.1 Authentification et gestion des accès
L'accès à l'application est conditionné par une authentification par identifiant et mot de passe. Deux niveaux de privilèges sont définis :

| Rôle | Droits accordés | Restrictions |
|------|----------------|--------------|
| Consultant | Visualisation du tableau de bord, consultation de l'historique, export | Aucun droit d'action sur les actionneurs ni de modification des seuils. |
| Opérateur | Tous les droits du consultant, plus : déclenchement manuel des actionneurs, modification des seuils, gestion des utilisateurs. | |

### 3.3.2 Tableau de bord
• Affichage en temps réel des valeurs collectées par les cinq capteurs. • Représentation graphique de l'évolution de chaque paramètre en fonction du temps. • Indicateurs visuels d'état des actionneurs (actif / inactif). • Zone d'affichage des alertes actives.

### 3.3.3 Gestion des actionneurs
• Déclenchement et arrêt manuels de la pompe d'irrigation, de la ventilation et de l'éclairage. • Confirmation visuelle de l'état réel de l'actionneur après exécution de la commande.

### 3.3.4 Historique et traçabilité
• Journalisation de l'ensemble des mesures capteurs avec horodatage. • Journalisation de toutes les actions effectuées (automatiques et manuelles) avec indication de l'origine. • Interface de consultation filtrée par date, type d'action ou capteur. • Export de l'historique au format CSV.

### 3.3.5 Alertes
Exemple d'alerte définissable dans le système :

| Identifiant | Condition de déclenchement | Message affiché |
|-------------|----------------------------|-----------------|
| AL-01 | Humidité du sol inférieure au seuil critique. | Seuil critique d'humidité atteint — irrigation nécessaire. |
| AL-02 | Température hors des bornes définies. | Température hors normes — risque pour les cultures. |
| AL-03 | Taux de CO2 supérieur au seuil de sécurité. | Concentration de CO2 anormale — aération requise. |
| AL-04 | Niveau du réservoir d'eau atteignant le minimum. | Réservoir d'eau vide — intervention requise. |
| AL-05 | Luminosité inférieure au seuil pendant une durée prolongée. | Luminosité insuffisante — éclairage artificiel conseillé. |

## 3.4 Application d'automatisation — CLI (AA)
L'application d'automatisation est un script exécutable en ligne de commande. Elle permet à l'utilisateur de déclencher des actions sur les actionneurs sans passer par l'interface web ni interagir directement avec l'ESP32. Elle constitue un second canal d'intervention complémentaire à l'interface graphique.

Les fonctionnalités couvertes par le script sont les suivantes : • Affichage d'un menu interactif proposant le choix entre les actions disponibles (irrigation, ventilation, éclairage). • Exécution de l'action sélectionnée avec retour d'information à l'utilisateur. • Enregistrement automatique de chaque exécution dans un fichier de journalisation horodaté. • Possibilité d'exécution en mode silencieux (batch) pour une intégration dans des scripts de planification.

# 4. Stack technologique retenue
Cette section presente la stack technologique arretee par le groupe 6, accompagnee d'une justification pour chaque choix. Ces decisions constituent la reference technique du projet et guideront l'ensemble des phases de developpement.

| Composante | Technologie retenue | Justification |
|------------|---------------------|----------------|
| Microcontroleur | ESP32 (Espressif) | Wi-Fi integre, double coeur, faible consommation, compatibilite Arduino/MicroPython. |
| Base de donnees | PostgreSQL | Robustesse, support avance des requetes complexes, typage strict, fiabilite eprouvee en production. |
| Back-end | Django (Python) | Synergie avec Python cote ESP32, ORM integre, Django REST Framework pour l'API. |
| Front-end | React | Architecture par composants, ecosysteme de visualisation mature (Recharts, Chart.js). |
| Broker MQTT | Mosquitto | Logiciel libre, leger, largement documente, compatible ESP32. |
| Protocole IoT | MQTT (pub/sub) | Protocole leger adapte aux microcontroleurs et reseaux a bande passante limitee. |
| API back-end | REST over HTTP | Standard interoperable, consommable depuis React et depuis le script CLI. |
| Script CLI (AA) | Python (script batch) | Coherence avec Django, execution multi-plateforme, integration dans taches planifiees. |

## 4.1 Base de donnees - PostgreSQL
PostgreSQL est un systeme de gestion de bases de donnees relationnelles et objet, reconnu pour sa conformite aux standards SQL et sa robustesse en environnement de production. Dans le contexte de ce projet, il offre plusieurs avantages determinants : • Gestion native des types de donnees complexes utiles pour stocker les series temporelles de mesures capteurs. • Support des contraintes d'integrite referentielle garantissant la coherence des donnees entre les tables. • Performances stables sur des volumes de donnees croissants, compatibles avec un usage continu. • Integration native avec Django via l'ORM (psycopg2), sans configuration additionnelle complexe.

## 4.2 Back-end - Django et Django REST Framework
Django est un framework web Python de haut niveau, concu pour favoriser un developpement rapide et une conception propre. Il est retenu pour les raisons suivantes : • Coherence linguistique avec la programmation de l'ESP32, qui peut egalement etre developpe en MicroPython. • ORM integre permettant de manipuler la base de donnees PostgreSQL sans ecrire de requetes SQL brutes. • Module Django REST Framework (DRF) offrant une generation rapide des endpoints de l'API REST consommee par React et par le script CLI. • Systeme d'authentification integre (tokens JWT via djangorestframework-simplejwt) applicable aux exigences de gestion des roles. • Gestion des abonnements MQTT possible via la bibliotheque paho-mqtt, permettant une integration directe dans le back-end.

## 4.3 Front-end - React
React est une bibliotheque JavaScript developpee par Meta, fondee sur une architecture par composants reutilisables et un rendu declaratif de l'interface utilisateur. Son choix est justifie par : • Architecture par composants permettant de structurer le tableau de bord de maniere modulaire : un composant par capteur, un composant pour les alertes, un composant pour l'historique. • Ecosysteme de bibliotheques de visualisation mature : Recharts et Chart.js pour les graphiques de series temporelles. • Gestion de l'etat applicatif via les hooks React (useState, useEffect) ou Redux pour les etats partages. • Compatibilite avec Tailwind CSS ou Material UI pour une interface responsive sans surcharge de configuration. • Large communaute et documentation abondante, favorable a la resolution rapide des problemes.

# 5. Protocoles de communication
## 5.1 MQTT — Collecte des données capteurs
Le protocole MQTT (Message Queuing Telemetry Transport) est retenu pour la communication entre l'ESP32 et le serveur applicatif lors de la transmission des données capteurs. Ce choix repose sur les caractéristiques suivantes : • Protocole léger, conçu pour les environnements à ressources contraintes et les réseaux peu fiables. • Architecture de type publication/abonnement (pub/sub) permettant un découplage entre le producteur de données (ESP32) et le consommateur (serveur). • Prise en charge de trois niveaux de qualité de service (QoS 0, 1, 2) adaptables selon la criticité du message. • Disponibilité de bibliothèques éprouvées pour l'ESP32 (PubSubClient, esp-mqtt). Un broker MQTT devra être déployé sur le serveur (Mosquitto est la solution recommandée pour ce contexte).

## 5.2 HTTP — Communication entre l'ESP32 et l'application web
Le protocole HTTP est utilisé pour les échanges dans le sens application web vers ESP32, notamment pour l'envoi de commandes manuelles (déclenchement d'un actionneur depuis l'interface). Une API REST minimale sera exposée par l'ESP32 ou par le back-end applicatif selon l'architecture retenue.

Les endpoints minimaux identifiés à ce stade sont les suivants :

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /capteurs | Récupération des dernières valeurs enregistrées par les capteurs. |
| POST | /actionneurs/irrigation | Déclenchement ou arrêt de la pompe d'irrigation. |
| POST | /actionneurs/ventilation | Déclenchement ou arrêt du système de ventilation. |
| POST | /actionneurs/eclairage | Allumage ou extinction de l'éclairage artificiel. |
| GET | /historique | Récupération de l'historique des mesures et des actions avec filtres optionnels. |
| GET | /alertes | Récupération des alertes actives. |

# 6.How to run
## 6.1 CMD — Comment faire tourner le serveur

Suite de commande a executer:

creation d'un fichier venv
-python -m name_venv
-name_venv\Scripts\activate
-python install -m requirements.txt
-cd backend
-python manage.py makemigration
-python manage.py migration
-python manage.py createsuperuser
Dans un autres terminal
-cd frontend
-npm run dev

NB:
-Il faut que le Serveur soit connecter sur le meme reseau wifi que l'ESP32

---
