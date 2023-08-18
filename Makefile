NAME = ft_trascendence

all:
	bash ip.sh
	docker-compose -f docker-compose.yml up --build

stop:
	docker-compose -f docker-compose.yml down

prune: stop
	docker system prune -f -a --volumes

clean: prune
	rm -r -v backend/node_modules backend/dist frontend/node_modules
	
re: prune
	docker-compose -f docker-compose.yml up --build

