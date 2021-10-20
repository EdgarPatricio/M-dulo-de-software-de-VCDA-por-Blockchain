import React from 'react';
import App from './App';
import '@testing-library/jest-dom';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createSerializer } from 'enzyme-to-json';

Enzyme.configure({ adapter: new Adapter() });
expect.addSnapshotSerializer(createSerializer({ mode: 'deep' }));

describe('Pruebas unitarias a: <App />', () => {
  let stateConecction = { web3: true };
  let wrapperNoConnection = shallow(<App />);
  let wrapperConnection = shallow(<App />).setState(stateConecction);
  let stateRegisterCDA;
  let stateValidateCDA;
  let stateShowValidate;
  let stateShowRegister;
  let stateCDAIsAuthentic;
  let stateCDAIsNoAuthentic;

  beforeEach(() => {
    wrapperNoConnection = shallow(<App />);
    wrapperConnection = shallow(<App />).setState(stateConecction);
    stateShowValidate = { web3: true, showRegister: false, showValidate: true , isDeploymentOwner: true};
    stateShowRegister = { web3: true, showRegister: true, showValidate: false , isDeploymentOwner: true};
    stateCDAIsAuthentic = { web3: true, showRegister: false, showValidate: true, validate: true };
    stateCDAIsNoAuthentic = { web3: true, showRegister: false, showValidate: true, validate: false };
    stateRegisterCDA = {
      web3: true,
      showRegister: true,
      showValidate: false,
      storageDNI: '1104717572',
      storageHashCAD: '19607064cec2aa57d49d848fb09a720aaf511c7b01eb18577a115ba0b5d5d7bc'
    };

    stateValidateCDA = {
      web3: true,
      showRegister: false,
      showValidate: true,
      storageDNI: '1104717572',
      storageHashCAD: '19607064cec2aa57d49d848fb09a720aaf511c7b01eb18577a115ba0b5d5d7bc'
    };
  });

  test('Renderizar <App /> al no estar conectado a web3, cuentas, contrato o metamask ', () => {
    expect(wrapperNoConnection).toMatchSnapshot();
    expect(wrapperNoConnection.find(App)).toBeDefined();
  });

  test('Renderizar <App /> correctamente al estar conectado correctamente', () => {
    expect(wrapperConnection).toMatchSnapshot();
    expect(wrapperConnection.find(App)).toBeDefined();
  });

  test('Mostrar formulario para validar un CDA', () => {
    const wrapper = shallow(<App />).setState(stateShowValidate);
    const counterText = wrapper.find('button').at(2).text().trim();
    expect(counterText).toBe('Validar');
    expect(wrapper.find('button').at(0).hasClass('active')).toEqual(true);
    expect(wrapper.find('button').at(1).hasClass('active')).toEqual(false);
  });

  test('Mostrar formulario para registrar un CDA', () => {
    const wrapper = shallow(<App />).setState(stateShowRegister);
    const counterText = wrapper.find('button').at(2).text().trim();
    expect(wrapper.contains(<input className="file-path" placeholder="No se ha elegido ningún archivo" type="text"/>)).toEqual(true);
    expect(counterText).toBe('Registrar en Blockchain');
    expect(wrapper.find('button').at(0).hasClass('active')).toEqual(false);
    expect(wrapper.find('button').at(1).hasClass('active')).toEqual(true);
  });

  test('Mostrar el mensaje adecuado cuando el CDA es autentico', () => {
    let wrapper = shallow(<App />).setState(stateCDAIsAuthentic);
    const counterText = wrapper.find('span').at(5).text().trim();
    expect(counterText).toBe('Es auténtico');
  });

  test('Mostrar el mensaje adecuado cuando el CDA no es autentico', () => {
    let wrapper = shallow(<App />).setState(stateCDAIsNoAuthentic);
    const counterText = wrapper.find('span').at(5).text().trim();
    expect(counterText).toBe('No es auténtico');
  });

  test('Llamar a componentDidMount()', async () => {
    const wrapper = mount(<App />).setState(stateConecction);
    const instance = wrapper.instance();
    jest.spyOn(instance, 'componentDidMount')
    expect(instance.componentDidMount).toHaveBeenCalledTimes(0);
  });

  test('Llamar a la función run()', () => {
    const wrapper = mount(<App />).setState(stateConecction);
    const instance = wrapper.instance();
    jest.spyOn(instance, 'run')
    expect(instance.run).toHaveBeenCalledTimes(0);
  });

  test('Llamar a la función handleSubmit()', () => {
    const wrapper = mount(<App />).setState(stateRegisterCDA);
    const instance = wrapper.instance();
    jest.spyOn(instance, 'handleSubmit')
    expect(instance.handleSubmit).toHaveBeenCalledTimes(0);
  });

  test('Llamar a la función handleValidate()', () => {
    const wrapper = mount(<App />).setState(stateValidateCDA);
    const instance = wrapper.instance();
    jest.spyOn(instance, 'handleValidate')
    expect(instance.handleValidate).toHaveBeenCalledTimes(0);
  });

  test('Llamar a la función handleChangeValidate()', () => {
    const handleChangeValidate = jest.fn();
    const wrapper = shallow((<button onClick={handleChangeValidate}>Validar certificados</button>));
    wrapper.find('button').simulate('click');
    expect(handleChangeValidate.mock.calls.length).toEqual(1);
  });

  test('Llamar a la función handleChangeRegister()', () => {
    const handleChangeRegister = jest.fn();
    const wrapper = shallow((<button onClick={handleChangeRegister}>Registrar certificados</button>));
    wrapper.find('button').simulate('click');
    expect(handleChangeRegister.mock.calls.length).toEqual(1);
  });

  test('Llamar a la función readFile()', () => {
    const wrapper = mount(<App />).setState(stateValidateCDA);
    const instance = wrapper.instance();
    jest.spyOn(instance, 'readFile')
    expect(instance.readFile).toHaveBeenCalledTimes(0);
  });
});
