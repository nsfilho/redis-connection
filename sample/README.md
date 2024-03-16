# Introduction

Running sample files example, you will need `ts-node` in your system. If you have this
globally you can ignore the nexts steps. But if you don't have (or you prefer not change the codes),
use the steps bellow:

1. Clone this repo;
2. Add all dependencies;
3. Run the sample of you want.

```sh
git clone https://github.com/nsfilho/redis.git
cd redis
npm install

# Run the most basic way
npx ts-node sample/index.ts

# For debug purpose
node --require ts-node/register --inspect sample/index.ts

```
