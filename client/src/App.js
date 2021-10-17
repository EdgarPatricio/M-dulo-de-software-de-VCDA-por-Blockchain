import React, { Component } from "react";
import StorageCADContract from "./contracts/StorageCAD.json";
import getWeb3 from "./getWeb3";

// Librería para generar el hash sha256
import sha256 from "js-sha256";

// Librería para generar las alertas
import Swal from 'sweetalert2';
import 'animate.css';

import "./App.css";

import initial from './img/data-security.svg';
import valid from './img/valid.svg';
import invalid from './img/invalid.svg';

class App extends Component {

  state = { storageDNI: "", storageHashCAD: "", validate: null, showValidate: true, showRegister: false, numberOfRegistrations: 0, web3: null, accounts: null, contract: null, isDeploymentOwner: null, balance: null };
  constructor(props) {
    super(props);
    // create a ref to store the textInput DOM element
    this.fileInput = React.createRef();
    this.textFileInput = React.createRef();
  }
  componentDidMount = async () => {
    Swal.fire({
      title: 'Cargando...',
      html: '<b>Inicia sesión </b> en la wallet de MetaMask<br />',
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading()
      },
      allowOutsideClick: () => {
        const popup = Swal.getPopup()
        popup.classList.remove('swal2-show')
        setTimeout(() => {
          popup.classList.add('animate__animated', 'animate__headShake')
        })
        setTimeout(() => {
          popup.classList.remove('animate__animated', 'animate__headShake')
        }, 500)
        return false
      }
    });
    try {

      // Obtener el proveedor de red y la instancia web3.
      const web3 = await getWeb3();

      // Usar web3 para obtener las cuentas de los usuarios.
      const accounts = await web3.eth.getAccounts();

      // Obtener la instancia del contrato StorageCAD.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = StorageCADContract.networks[networkId];
      const instanceContract = new web3.eth.Contract(
        StorageCADContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Obtener el saldo de la cuenta con la que se generará las transacciones
      const balance = await web3.eth.getBalance(accounts[0]);
      const balanceETHER = web3.utils.fromWei(balance, 'ether');

      // Consultar el dueño del despliegue de los contratos y comparar si es la cuenta con la que se encuentra conectado.
      const deploymentOwner = await instanceContract.methods.owner().call();
      if (accounts[0] === deploymentOwner) {
        this.setState({ isDeploymentOwner: true });
      } else {
        this.setState({ isDeploymentOwner: false });
      };

      // Establece el estado de web3, cuentas y contrato, y luego procede
      // con la interacción del método del contrato para conocer el número de registros
      this.setState({ web3, accounts, contract: instanceContract, balance: balanceETHER }, this.run);
    } catch (error) {
      // Captura de errores para cualquiera de las operaciones anteriores.
      Swal.fire({
        icon: 'error',
        title: '¡Atención!',
        html: 'No se ha podido cargar',
        timer: 3000,
        showConfirmButton: false,
      });
      console.error(error);
    }
  };

  // La función run usa el método numbersCADs para conocer el número de registros de CADs
  run = async () => {
    Swal.fire({
      icon: 'success',
      title: '¡Correcto!',
      timer: 700,
      showConfirmButton: false,
    });
    const { contract, isDeploymentOwner, balance } = this.state;
    if (isDeploymentOwner === true) {
      if (balance > 0) {
        Swal.fire({
          icon: 'info',
          title: 'Saldo de tu cuenta:',
          text: balance + ' ETH',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'El saldo de tu cuenta es de: ' + balance + ' ETH',
          text: 'No tienes fondos suficientes para registrar pero si puedes validar',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          showCloseButton: true,
        });
      }
    };
    const number = await contract.methods.numbersCADs().call();
    this.setState({ numberOfRegistrations: number });
  };

  // La función handleSubmit  usa los métodos para crear el registro de un CAD en la red Blockchain
  // teniendo en cuenta si ya se encuentra registrado o no
  handleSubmit = async () => {
    const { storageDNI, storageHashCAD, accounts, contract } = this.state;
    const registered = await contract.methods.findHash(storageHashCAD).call();

    // Se comprueba que los campos no esten vacios
    if (storageDNI === "" || storageHashCAD === "") {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Los campos deben estar completos para registrar el certificado académico digital en la red Blockchain',
        confirmButtonText: 'Aceptar',
      });
    }
    // Se comprueba que no este registrado
    else if (registered === false) {
      Swal.fire({
        title: 'Espere...',
        html: '<b>Confirmar</b> la transacción y esperar el mensaje de confirmación (esto tomará un tiempo)... <br />',
        didOpen: () => {
          Swal.showLoading()
        },
        allowOutsideClick: () => {
          const popup = Swal.getPopup()
          popup.classList.remove('swal2-show')
          setTimeout(() => {
            popup.classList.add('animate__animated', 'animate__headShake')
          })
          setTimeout(() => {
            popup.classList.remove('animate__animated', 'animate__headShake')
          }, 500)
          return false
        }
      });
      try {
        let result = await contract.methods.registerCAD(storageDNI, storageHashCAD, accounts[0]).send({ from: accounts[0] });
        Swal.fire({
          icon: 'success',
          title: '¡Correcto!',
          text: 'El certificado académico digital se registró en la red Blockchain con éxito',
          confirmButtonText: 'Aceptar',
        });
        console.log(result);
      } catch (error) {
        Swal.fire({
          icon: 'warning',
          title: '¡Atención!',
          html: 'Error al registrar el certificado académico digital <br />' +
            'Inténtelo más tarde o revise el siguiente mensaje:' +
            '<hr style="border:1px dashed #dfdfdf; width:90%"></hr>' +
            '<span style="color:red">Error: </span>(' +
            error.message + ')',
          confirmButtonText: 'Aceptar',
        });
      };

    } else {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'El certificado académico digital ya se encuentra registrado en la red Blockchain',
        confirmButtonText: 'Aceptar',
      });
    }

    // Se actualiza el estado del número de registros para mostrar en pantalla
    const number = await contract.methods.numbersCADs().call();
    this.setState({ numberOfRegistrations: number });
  };

  // Función para obtener los valores de los inputs en el formulario
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  };

  // Función para validar si el CAD es o no autentico
  handleValidate = async () => {
    const { storageDNI, storageHashCAD, contract } = this.state;
    if (storageDNI === "" || storageHashCAD === "") {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Los campos deben estar completos para validar la autenticidad del certificado académico digital',
        confirmButtonText: 'Aceptar',
      });
    } else {
      try {
        const response = await contract.methods.validateCAD(storageDNI, storageHashCAD).call();
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'info',
          title: 'Validación de autenticidad realizada, observe el resultado en pantalla'
        });
        this.setState({ validate: response });
      } catch (error) {
        Swal.fire({
          icon: 'warning',
          title: '¡Atención!',
          html: 'Error al registrar el certificado académico digital <br />' +
            'Inténtelo más tarde o revise el siguiente mensaje:' +
            '<hr style="border:1px dashed #dfdfdf; width:90%"></hr>' +
            '<span style="color:red">Error: </span>(' +
            error.message + ')',
          confirmButtonText: 'Aceptar',
        });
      };
    }
  };

  // Función para mostrar el formulario de registro
  handleChangeValidate = async () => {
    this.setState({ showValidate: true });
    this.setState({ showRegister: false });
    this.setState({ storageDNI: "" });
    this.setState({ storageHashCAD: "" });
    this.setState({ validate: null });
  };

  // Función para mostrar el formulario de validación
  handleChangeRegister = async () => {
    this.setState({ showValidate: false });
    this.setState({ showRegister: true });
    this.setState({ storageDNI: "" });
    this.setState({ storageHashCAD: "" });
    this.setState({ validate: null });
  };
  // Método para leer el documento en formato PDF
  readFile = (e) => {
    const input = this.fileInput.current;
    const inputTextFile = this.textFileInput.current;
    const extValidate = /(.pdf)$/i;
    if (!extValidate.exec(input.value)) {
      inputTextFile.classList.remove('invalid');
      inputTextFile.classList.add('invalid');
      this.setState({ storageHashCAD: "" });
    } else {
      inputTextFile.classList.remove('invalid');
      inputTextFile.classList.add('valid');
      const file = e.target.files[0];
      if (!file) return;

      const fileReader = new FileReader();

      // El formato al que se convierte el terxto es a un String binario
      fileReader.readAsBinaryString(file);

      fileReader.onload = () => {
        // El algoritmo de función hash criptográfica seleccionado es el SHA256 o HASH256
        const hash256File = sha256(fileReader.result);
        this.setState({ storageHashCAD: hash256File });
      }

      fileReader.onerror = () => {
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: fileReader.error,
          allowEscapeKey: false,
          confirmButtonText: 'Aceptar',
          allowOutsideClick: () => {
            const popup = Swal.getPopup()
            popup.classList.remove('swal2-show')
            setTimeout(() => {
              popup.classList.add('animate__animated', 'animate__headShake')
            })
            setTimeout(() => {
              popup.classList.remove('animate__animated', 'animate__headShake')
            }, 500)
            return false
          }
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload(true);
          }
        });
        console.log(fileReader.error);
      }
    }
  };

  render() {

    // Se compruba la conexión con web3
    if (!this.state.web3) {
      return (
        <div className="container row">
          <div className="col m2 hide-on-small-and-down"></div>
          <div className="col s12 m8">
            <div className="alert card amber lighten-4 brown-text hide-on-small-and-down">
              <div className="close">
                <i data-dismiss="alert" aria-label="Close" className="fas fa-times"></i>
              </div>
              <div className="card-content">
                <p>
                  <i className="fas fa-exclamation-circle"></i> <span>Atención:</span>
                  Compruebe que su navegador sea <strong>Chrome</strong> o <strong>Firefox</strong>.
                </p>
              </div>
            </div>
            <div className="alert card amber lighten-4 brown-text hide-on-small-and-down">
              <div className="close">
                <i data-dismiss="alert" aria-label="Close" className="fas fa-times"></i>
              </div>
              <div className="card-content">
                <p>
                  <i className="fas fa-exclamation-circle"></i> <span>Atención:</span>
                  Tener instalado la extensión <strong>MetaMask</strong> (<strong>iniciar sesión</strong> o <strong>crear cuenta</strong>), más información <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">aquí</a>.
                </p>
              </div>
            </div>
            <div className="alert card amber lighten-4 brown-text show-on-small show-on-medium hide-on-med-and-up">
              <div className="close">
                <i data-dismiss="alert" aria-label="Close" className="fas fa-times"></i>
              </div>
              <div className="card-content">
                <p>
                  <i className="fas fa-exclamation-circle"></i> <span>Atención:</span>
                  Si está intentando ingresar desde el navegador de su móvil, hágalo por medio de la aplicación móvil de MetaMask, más información <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">aquí</a>.
                </p>
              </div>
            </div>
            <div className="alert card amber lighten-4 brown-text">
              <div className="close">
                <i data-dismiss="alert" aria-label="Close" className="fas fa-times"></i>
              </div>
              <div className="card-content">
                <p>
                  <i className="fas fa-exclamation-circle"></i> <span>Atención:</span>Estar conectado a la red <strong>Rinkeby</strong>
                </p>
              </div>
            </div>
          </div>
          <div className="col m2 hide-on-small-and-down"></div>
        </div>
      )
    }
    return (
      <div className="container">
        {/* Sección de título */}
        <div className="center">
          <h5 className="principal-title">Validación de autenticidad de los certificados académicos digitales</h5>
          <br />
        </div>
        <div className="row">
          {this.state.showRegister === true && this.state.isDeploymentOwner === true &&
            <div className="row">
              <div className="col s12 m6">
                <ul className="tabs container-one">
                  <li className="tab col s6"><button onClick={this.handleChangeValidate}>Validar certificados</button></li>
                  <li className="tab col s6 active"><button className="active" onClick={this.handleChangeRegister}>Registrar certificados</button></li>
                </ul>
              </div>
            </div>
          }
          {this.state.showValidate === true && this.state.isDeploymentOwner === true &&
            <div className="row">
              <div className="col s12 m6">
                <ul className="tabs container-one">
                  <li className="tab col s6 active"><button data-testid="btnChangeValidate" className="active" onClick={this.handleChangeValidate}>Validar certificados</button></li>
                  <li className="tab col s6"><button data-testid="btnChangeRegister" onClick={this.handleChangeRegister}>Registrar certificados</button></li>
                </ul>
              </div>
            </div>
          }
          <div className="row">
            <div className="col s12 m6">
              <span>Complete los campos correctamente:</span>
            </div>
          </div>

          <div className="row container-two">
            {/* Sección de registro de CAD */}
            {this.state.showRegister === true &&
              <div className="col s12 m6">
                <div className="row">
                  <div className="input-field">
                    <input id="dni" type="text" name="storageDNI" value={this.state.storageDNI} onChange={this.handleInputChange} />
                    <label className="active">Número de DNI:</label>
                    <span className="helper-text">Ingrese el número de DNI</span>
                  </div>
                  <div className="file-field input-field">
                    <div className="btn">
                      <span>Subir archivo</span>
                      <input type="file" name="inputfile" ref={this.fileInput} multiple={false} onChange={this.readFile} accept=".pdf" />
                    </div>
                    <div className="file-path-wrapper">
                      <input className="file-path" ref={this.textFileInput} placeholder="No se ha elegido ningún archivo" type="text" />
                      <span className="helper-text" data-error="El certificado seleccionado debe ser un archivo PDF" data-success="El certificado seleccionado tiene el formato adecuado" >Subir el certificado académico digital en formato PDF</span>
                    </div>
                  </div>
                  {this.state.storageHashCAD !== "" &&
                    <div className="input-field">
                      <span className="helper-text"><i className="fas fa-info-circle"></i> SHA-256 del certificado: {this.state.storageHashCAD}</span>
                    </div>
                  }
                </div>
                <div className="center">
                  <button type="button" data-test-id="test-button-register" className="btn btnBlueUNL" disabled={this.state.storageDNI === "" || this.state.storageHashCAD === ""} onClick={this.handleSubmit}>Registrar en Blockchain</button>
                </div>
                <div className="alert card blue lighten-4 blue-text text-darken-3">
                  <div className="card-content">
                    <p><i className="fas fa-info-circle"></i> <span>Información:</span> Actualmente existen <span>{this.state.numberOfRegistrations}</span>certificados académicos digitales registrados en la red Rinkeby de Ethereum.</p>
                  </div>
                </div>
                <p></p>
                <p></p>
              </div>
            }

            {/* Sección de validación de CAD */}
            {this.state.showValidate === true &&
              <div className="col s12 m6">
                <div className="row">
                  <div className="input-field">
                    <input id="dni" type="text" name="storageDNI" value={this.state.storageDNI} onChange={this.handleInputChange} />
                    <label className="active">Número de DNI:</label>
                    <span className="helper-text">Ingrese el número de DNI</span>
                  </div>
                  <div className="file-field input-field">
                    <div className="btn">
                      <span>Subir archivo</span>
                      <input type="file" name="inputfile" ref={this.fileInput} multiple={false} onChange={this.readFile} accept=".pdf" />
                    </div>
                    <div className="file-path-wrapper">
                      <input className="file-path" ref={this.textFileInput} placeholder="No se ha elegido ningún archivo" type="text" />
                      <span className="helper-text" data-error="El certificado seleccionado debe ser un archivo PDF" data-success="El certificado seleccionado tiene el formato adecuado" >Subir el certificado académico digital en formato PDF</span>
                    </div>
                  </div>
                </div>
                <div className="center">
                  <button type="button" data-test-id="test-button-validate" className="btn btnBlueUNL" disabled={this.state.storageDNI === "" || this.state.storageHashCAD === ""} onClick={this.handleValidate}>Validar</button>
                </div>
              </div>
            }
            <div className="col s12 m1 hide-on-small-and-down"></div>
            <div className="col s12 m1 verticalLine hide-on-small-and-down"></div>

            {/* Sección de inicio indicando que el sistema está listo */}
            {this.state.validate === null &&
              <div className="col s12 m4 center">
                <div className="card-content">
                  <img className='img-initial' src={initial} alt="El sistema está listo" /> <br />
                  <span className="second-title-cost">El sistema está listo</span>
                </div>
              </div>
            }

            {/* Sección de validación positiva de CAD */}
            {this.state.validate === true &&
              <div className="col s12 m4 center">
                <div className="row " >
                  <div className="col s12">
                    <div className="card">
                      <div className="card-content">
                        <span className="">El certificado académico digital:</span> <br /> <br />
                        <img className='img-result' src={valid} alt="" /> <br />
                        <span className="second-title-cost">Es auténtico</span>
                      </div>
                      <div className="card-action">
                        <a href="./">Validar otro documento</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            {/* Sección de validación negativa de CAD */}
            {this.state.validate === false &&
              <div className="col s12 m4 center">
                <div className="row " >
                  <div className="col s12">
                    <div className="card">
                      <div className="card-content">
                        <span className="">El certificado académico digital:</span> <br /> <br />
                        <img className='img-result' src={invalid} alt="" /> <br />
                        <span className="red-text-UNL">No es auténtico</span>
                      </div>
                      <div className="card-action">
                        <a href="./">Validar otro documento</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div >
    );
  }
}

export default App;
