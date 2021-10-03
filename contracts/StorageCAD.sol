// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract StorageCAD{
    // Variables y funciones para obtener el propietario del despliegue del contrato
    address public owner;
    modifier restricted() {
    if (msg.sender == owner) _;
    }
    constructor() public {
    owner = msg.sender;
    }
    
    uint nextId;
    // Estrucutura del certificado académico digital
    struct CAD{
        uint id;
        string dni;
        string hashCAD;
    }

    // Arreglo de los certificados académicos digitales

    CAD[] cads;

    // La función es para crear o registrar el CAD en la Blockchain de Ethereum
    // El guión bajo es un estandar de solidity para los parámetros
    function registerCAD(string memory _dni, string memory _hashCAD, address _owner) public {
        // Reutilizo la función para saber si el dni y certificado ya fue registrado para no duplicar información
        bool registered = findHash(_hashCAD);
        if(registered == false){
            // Verificar que el propietario del despliegue del contrato sea el mismo para registrar
            if (owner == _owner){
                cads.push(CAD(nextId, _dni, _hashCAD));
                nextId++;
            }else{
                revert("Intento registrar con una cuenta diferente al propietario del despliegue del contrato");
            }
        }else{
            revert("El certificado academico digital esta duplicado");
        }
   }

   // Esta función busca en el arreglo de CAD por dni y hash del CAD, devuelve un booleano
   // El certificado a validar debe coincidir en el dni y el hash del CAD para obtner un valor de TRUE

   function validateCAD(string memory _dni, string memory _hashCAD) public view returns(bool){
       for(uint i = 0; i < cads.length; i++) {
           if (keccak256(abi.encodePacked((cads[i].dni))) == keccak256(abi.encodePacked((_dni))) && keccak256(abi.encodePacked((cads[i].hashCAD))) == keccak256(abi.encodePacked((_hashCAD)))) {
               return true;
           }
       }
   }

   function findHash(string memory _hashCAD) public view returns(bool){
       for(uint i = 0; i < cads.length; i++) {
           if (keccak256(abi.encodePacked((cads[i].hashCAD))) == keccak256(abi.encodePacked((_hashCAD)))) {
               return true;
           }
       }
   }

   // Esta función busca el index de la ubicación en el arreglo para ser usado en las funciones de read, update y delete
   function findIndex(string memory _dni, string memory _hashCAD) internal view returns (uint) {
       for(uint i = 0; i < cads.length; i++) {
           if (keccak256(abi.encodePacked((cads[i].dni))) == keccak256(abi.encodePacked((_dni))) && keccak256(abi.encodePacked((cads[i].hashCAD))) == keccak256(abi.encodePacked((_hashCAD)))) {
               return i;
           }
       }
       // En caso de no encontrar el documento indica el siguiente mensaje
       revert('El certificado academico digital no fue encontrado');
   }

   // Obtener la información del CAD
   function readCAD(string memory _dni, string memory _hashCAD) public view returns(uint, string memory, string memory){
       uint index = findIndex(_dni,_hashCAD);
       return (cads[index].id,cads[index].dni,cads[index].hashCAD);
   }

   // Actualizar la información del CAD
   function updateCAD (string memory _dni, string memory _hashCAD) public {
       uint index = findIndex(_dni,_hashCAD);
       cads[index].dni = _dni;
       cads[index].hashCAD = _hashCAD;
   }

   // Elimnar la información del CAD
   // El eliminar los datos de Blockchain no es posible,lo unico que se puede hacer es resetear estos datos.
   function deleteCAD(string memory _dni, string memory _hashCAD) public{
       uint index = findIndex(_dni,_hashCAD);
       delete cads[index];
   }

   // Función para obtener el número de registros de CAD
   function numbersCADs () public view returns(uint){
       uint size = cads.length;
       return size;
   }
}