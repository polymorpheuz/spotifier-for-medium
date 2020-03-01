echo "$(tput setaf 3)Bot interface$(tput sgr0) lambda deploy on $1 stage"

lerna bootstrap

cd ../services/bot/

rm -Rf node_modules

echo 'Installing dependencies'

yarn

echo 'Dependencies were successfully installed'

echo 'Copying reusable between lambdas modules built by lerna in local node_modules';

mkdir -p node_modules/@spotifier
cp -v -R -L ../../node_modules/@spotifier/* node_modules/@spotifier/ > /dev/null

echo 'Deploying lambda'

sls deploy --stage $1 || exit 1

echo 'Deploy was successfully completed'

echo 'Removing all node_modules, yarn.lock and .serverless'

rm -Rf node_modules
rm yarn.lock
rm -Rf .serverless

echo 'Done'
