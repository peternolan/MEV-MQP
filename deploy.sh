echo 'pass' | sudo -iS -u root
cd ./front-end
npm run build

cd ../back-end
mv ../front-end/build/ ./build/
npm run start