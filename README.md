# Módulo de validación de autenticidad de los certificados académicos digitales 

_El proyecto tiene por objetivo implementar un módulo de software para la validación de certificados académicos digitales por tecnología blockchain en el sistema de Eventos de la Universidad Nacional de Loja. Se utilizó la metodología agile block chain DApp engineering (ABCDE) para el desarrollo de todo el módulo de software, en sus diferentes fases_

## Tabla de contenido

- [Comenzando](#comenzando-)
  - [Pre-requistos](#pre-requisitos-)
  - [Instalación](#instalación-)
- [Despliegue](#despliegue-)
- [Ejecutando las pruebas](#ejecutando-las-pruebas-%EF%B8%8F).
  - [Pruebas unitarias subsistema de contratos inteligentes](#analizar-las-pruebas-unitarias-en-el-subsistema-de-contratos-inteligentes-).
  - [Pruebas unitarias subsistema de aplicaciones](#analizar-las-pruebas-unitarias-en-el-subsistema-de-contratos-inteligentes-).
  - [Pruebas de integración](#analizar-las-pruebas-de-integración-%EF%B8%8F).
- [Construcción](#construido-con-%EF%B8%8F)
- [Autores](#autores-%EF%B8%8F)
- [Licencia](#licencia-)
- [Expresiones de Gratitud](#expresiones-de-gratitud-)




## Comenzando 🚀

_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._

Mira **Deployment** para conocer como desplegar el proyecto.

 
### Pre-requisitos 📋

_Estas son las cosas que necesitas para instalar el software y como instalarlas_

* [Node.js](https://nodejs.org/es/download/) - Entorno en tiempo de ejecución multiplataforma, descargar e instalar de acuerdo al sistema operativo.
* [web3](https://rometools.github.io/rome/) - Una colección de bibliotecas de JavaScript, que te permiten interactuar con un nodo de Ethereum local o remoto mediante HTTP, IPC o WebSocket. Instalar con el comando:
```
npm install web3
```
* [Solidity](https://solidity-es.readthedocs.io/es/latest/installing-solidity.html) - Lenguaje de programación orientado a objetos para escribir contratos inteligentes. Instalar con el comando:
```
npm install -g solc
```
* [Truffle](https://www.trufflesuite.com/docs/truffle/getting-started/installation) - Paquete de herramientas de código abierto especializado en el desarrollo de aplicaciones sobre la Blockchain de Ethereum. Instalar con el comando:
```
npm install -g truffle
```
* Navegador web Mozilla Firefox o Chrome
* [MetaMask](https://metamask.io) - Instalar la extensión MetaMask y crear o iniciar sesión en un cuenta. Además de obtener fondos a través de una Ethereum Rinkeby Faucet Testnet
, más información de cómo realizarlo [aquí](https://medium.com/@julgq/c%C3%B3mo-enviar-eth-a-metamask-en-la-red-rinkeby-f3bbf388ba54). **NOTA**: Es importante tener fondos para poder realizar las transacciones.

### Instalación 🔧

_Una serie de ejemplos paso a paso que te dice lo que debes ejecutar para tener un entorno de desarrollo ejecutándose_

_Una vez clonado el repositorio, en la carpeta raíz ejecutar_

```
npm install
```

_Iniciar subsistema de contratos inteligentes_

```
truffle develop
compile
migrate
```
_Iniciar subsistema de aplicaciones (en **otra consola**, no en la que se ejecutó anteriormente para truffle, desde la carpeta raíz del proyecto)_
```
cd client
npm install
npm run start
```
**NOTA**: Es importante asegurarse que MetaMask este conectada a la **red localhost**
_Finaliza con un ejemplo de cómo obtener datos del sistema o como usarlos para una pequeña demo_

## Despliegue 📦

_Para realizar el deploy del sistema se debe realizar los siguientes pasos:_

1. Iniciar o crear una cuenta en [Infura](https://infura.io/) (Crear un proyecto sobre Ethereum).
2. Crear un documento .env en la carpeta raíz del proyecto con las siguiente variables de entorno:
* **MNEMONIC:** frase de recuperación de tu cuenta de MetaMask.
* **URL_INFURA:** credenciales entregadas por Infura, recuerda que deben ser creada sobre la red Rinkeby o deberás generar la configuración de red adicional, para más detalle [aquí](https://www.trufflesuite.com/docs/truffle/reference/configuration#networks).
```
MNEMONIC = "palabra1 palabra2 ..." 
URL_INFURA = "https://rinkeby.infura.io/v3/..."
````
**NOTA**: Es importante que estas credenciales no sean compartidas y se mantengan de forma segura y discreta.

3. Compilar y migrar el subsistema de contratos inteligentes con los siguientes comandos:
```
truffle develop
compile
migrate --network rinkeby // en este caso la red es rinkeby
```
4. Generar el **build**, en una consola ejecutar en la carpeta raíz del proyecto:
```
cd client
npm run build // o yarn build 
```
5. Ubicar en cualquier servicio de hosting, en este caso se uso Microsoft Azure para observar el resultado  ingrese [aquí](https://certificados-unl.azurewebsites.net/).

**NOTA**: Asegurarse que MetaMask este conectado a la red correcta, en este  caso a la testnet **Rinkeby**

## Ejecutando las pruebas ⚙️

_Para ejecutar las pruebas se realiza de la siguiente manera_

### Analizar las pruebas unitarias en el subsistema de contratos inteligentes 🔩

_Estas pruebas verifican que unidades de código del subsistema de contratos inteligentes funcionen correctamente_

```
truffle test
``````

### Analizar las pruebas unitarias  del subsistema de aplicaciones ⌨️

_Estas pruebas verifican que unidades de código del subsistema de aplicaciones funcionen correctamente_

Desde la carpeta raíz del proyecto:
```
cd client
npm run test
```
### Analizar las pruebas de integración ⛓️
_Estas pruebas verifican que los dos subsistemas funcionen y se integren correctamente_

Desde la carpeta raíz del proyecto:
```
cd client
npm run cy:open
```

## Construido con 🛠️

_Las herramientas que se utilizó para crear el proyecto:_

* [Node.js](http://www.dropwizard.io/1.0.2/docs/): Version 14.17.3
* [Truffle Suite](https://www.trufflesuite.com/): Version 5.4.1
* [web3](https://web3js.readthedocs.io/en/v1.4.0/): Version 1.4.0
* [js-sha256](https://www.npmjs.com/package/js-sha256): Version 0.9.0
* [Enzyme](https://www.npmjs.com/package/enzyme): Version 3.11.0
* [Jest-dom](https://jestjs.io/docs/tutorial-react): Version 5.14.1
* [Cypress](https://www.cypress.io/): Version 8.5.0
* [Solidity](https://solidity-es.readthedocs.io/es/latest/): Version 0.5.16
* [React](https://es.reactjs.org/) Version 17.0.2
* [GIT](https://git-scm.com/): Version 2.32.0
* [GitKraken](https://maven.apache.org/): Version 7.7.2
* [Visual Studio Code](): Version  1.58.0
* [Metamask](https://metamask.io/): Version 9.7.1
* [Microsoft Azure](https://azure.microsoft.com/es-es/) 


## Autores ✒️

_Las personas inmersas en el proyecto:_

* **Edgar Sánchez** - *Tesista* - [EdgarPatricio](https://github.com/EdgarPatricio)
* **Cristian Narváez** - *Director de tesis*  

## Licencia 📄

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE.md](LICENSE.md) para detalles.

## Expresiones de Gratitud 🎁

* Comenta a otros sobre este proyecto 📢
* Invita una cerveza 🍺 o un café ☕ a alguien del equipo. 
* Da las gracias públicamente 🤓.

---
⌨️ con ❤️ por [Edgar Sánchez](https://github.com/EdgarPatricio) 😊
