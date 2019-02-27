#echo 'pass' | sudo -iS
cd ./front-end
rm -r ./build/
npm run build

cd ../back-end
rm -r ./build/
mv ../front-end/build ./
npm run start