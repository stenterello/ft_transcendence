#!/bin/bash

is_valid() {
	if [ ${arr[0]} -le 255 ] \
		&& [ ${arr[1]} -le 255 ] \
		&& [ ${arr[2]} -le 255 ] \
		&& [ ${arr[3]} -le 255 ];
	then
		echo 0;
	else
		echo 1;
	fi
}

old_ifs="$IFS"
IFS='.'
ok="1"

while [ $ok != "0" ];
do
	read -p "Enter webapp server IP: " ip;
	read -ra arr <<< "$ip"
	if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]];
	then
		ok=$(is_valid);
	fi
	if [ $ok != "0" ]; then echo "IP address not valid"; fi
done

IFS=$old_ifs
#if [ $(uname -s) == "Darwin" ];
#then
#	sed -i '' "s/WEBAPPIP=*/WEBAPPIP=$ip/" .env
#else
#	sed -i "s/WEBAPPIP=*/WEBAPPIP=$ip/" .env
#fi
echo "WEBAPPIP=$ip">>.env
echo $ip;
