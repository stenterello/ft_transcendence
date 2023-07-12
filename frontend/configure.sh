#!/bin/bash

npm install
status=7
while [ $status == 7 ];
do
	echo "waiting for backend to start..."
	sleep 1
	curl backend:3000/ > /dev/null 2>&1
	status=$?
done
npm run dev -- --host
