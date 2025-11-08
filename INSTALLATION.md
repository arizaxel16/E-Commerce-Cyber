Axel Ariza, Juan esteban ocampo, Carlos cruz, Juan Pablo Corral, Andrea Paola Urganeta y Sebastian Gómez
Grupo Cognito
Deployment Guide

This guide explains how to run the pre-configured virtual machine and start the application using Docker Compose.

Requirements
	•	Virtualization software (e.g., VirtualBox or VMware)
	•	The provided .ova file

1. Import the Virtual Machine
	1.	Open VirtualBox (or your virtualization software).
	2.	Go to File → Import Appliance.
	3.	Select the provided .ova file.
	4.	Finish the import and start the virtual machine.

2. Log Into the Server

Use the credentials provided separately.

Example:

- username: user
- password: password

3. Navigate to the Project Directory

The project is located in the home folder.

cd ~/opt/arepabuelas/

(This folder contains the docker-compose.yaml file.)

4. Start the Application

Run:

docker compose up -d

This will start:
	•	Backend
	•	Database
	•	Web Frontend (if included in the compose file)

5. Check Containers

docker ps

You should see the application containers running.

6. Access the Application

Open a browser on your host machine and go to:

http://<VM-IP-ADDRESS>/

To check the VM’s IP address:

ip addr

Look for the IP under ens33, eth0, or similar network interface.

7. Stop the Application (If Needed)

docker compose down

Notes
	•	Secrets and DB initialization files are not included in this snapshot.
	•	The environment runs directly from container state as provided.
