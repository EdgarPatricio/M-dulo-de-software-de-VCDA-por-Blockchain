// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract StorageCDA{
    uint nextId;
    // Estrucutura del certificado digital académico
    struct CDA{
        uint id;
        string dni;
        string hashCDA;
    }

    // Arreglo de los certificados digitales académicos
    CDA[] cdas;

    // La función es para crear o registrar el CDA en la Blockchain de Ethereum
    // El guión bajo es un estándar de solidity para los parámetros
    function createCDA(string memory _dni, string memory _hashCDA) public {
      // Reutilizo la función para saber si el dni y certificado ya fue registrado para no duplicar información
        bool registered = validateCDA(_dni,_hashCDA);
        if(registered == false){
            cdas.push(CDA(nextId,_dni,_hashCDA));
            nextId++;
        }
   }

   // Esta función busca en el arreglo de CDA por dni y hash del CDA, devuelve un booleano
   // El certificado a validar debe coincidir en el dni y el hash del CDA para obtner un valor de TRUE

   function validateCDA(string memory _dni, string memory _hashCDA) public view returns(bool){
       for(uint i = 0; i < cdas.length; i++) {
           if (keccak256(abi.encodePacked((cdas[i].dni))) == keccak256(abi.encodePacked((_dni))) && keccak256(abi.encodePacked((cdas[i].hashCDA))) == keccak256(abi.encodePacked((_hashCDA)))) {
               return true;
           }
       }
   }

   // Esta función busca el index de la ubicación en el arreglo para ser usado en las funciones de read, update y delete
   function findIndex(string memory _dni, string memory _hashCDA) internal view returns (uint) {
       for(uint i = 0; i < cdas.length; i++) {
           if (keccak256(abi.encodePacked((cdas[i].dni))) == keccak256(abi.encodePacked((_dni))) && keccak256(abi.encodePacked((cdas[i].hashCDA))) == keccak256(abi.encodePacked((_hashCDA)))) {
               return i;
           }
       }
       // En caso de no encontrar el documento indica el siguiente mensaje
       revert('El certificado digital no fue encontrado');
   }

   // Obtener la  información del CDA
   function readCDA(string memory _dni, string memory _hashCDA) public view returns(uint, string memory, string memory){
       uint index = findIndex(_dni,_hashCDA);
       return (cdas[index].id,cdas[index].dni,cdas[index].hashCDA);
   }

   // Actualizar la  información del CDA
   function updateCDA (string memory _dni, string memory _hashCDA) public {
       uint index = findIndex(_dni,_hashCDA);
       cdas[index].dni = _dni;
       cdas[index].hashCDA = _hashCDA;
   }

   // Elimnar la  información del CDA
   // El eliminar los datos de Blockchain no es posible,lo unico que se puede hacer es resetear estos datos.
   function deleteCDA(string memory _dni, string memory _hashCDA) public{
       uint index = findIndex(_dni,_hashCDA);
       delete cdas[index];
   }

   // Función para obtener el número de registros de CDA
   function numbersCDAs () public view returns(uint){
       uint size = cdas.length;
       return size;
   }
}
