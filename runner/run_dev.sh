tsc
docker build -t cloud-sml-runner-standalone .
docker run -p 3001:3001 cloud-sml-runner-standalone