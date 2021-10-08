pragma solidity >=0.4.21 <0.7.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/StorageCAD.sol";

contract TestStorageCAD {
    StorageCAD storageCAD = StorageCAD(DeployedAddresses.StorageCAD());

    function testItRegisterCAD() public {
        address owner = storageCAD.owner();
        storageCAD.registerCAD(
            "1104717572",
            "19607064cec2aa57d49d848fb09a720aaf511c7b01eb18577a115ba0b5d5d7bc",
            owner
        );
        bool r = storageCAD.validateCAD(
            "1104717572",
            "19607064cec2aa57d49d848fb09a720aaf511c7b01eb18577a115ba0b5d5d7bc"
        );
        Assert.isTrue(r, "Debe retornar verdadero");
    }

    function testItValidateCADAuthentic() public {
        bool r = storageCAD.validateCAD(
            "1104717572",
            "19607064cec2aa57d49d848fb09a720aaf511c7b01eb18577a115ba0b5d5d7bc"
        );
        Assert.isTrue(r, "Debe ser verdadero al validar el CAD");
    }

    function testItValidateCADNotAuthentic() public {
        bool r = storageCAD.validateCAD(
            "1104717572",
            "19607064cec2aa57d49d848fb09a720aaf511c7b01eb18577a115ba0b5d5d7bd"
        );
        Assert.isFalse(r, "Debe ser falso al validar el CAD");
    }

    function testItFindHashCADRegistered() public {
        bool r = storageCAD.findHash(
            "19607064cec2aa57d49d848fb09a720aaf511c7b01eb18577a115ba0b5d5d7bc"
        );
        Assert.isTrue(r, "Debe ser verdadero al buscar el hashCAD");
    }

    function testItFindHashCADNotRegistered() public {
        bool r = storageCAD.findHash(
            "19607064cec2aa57d49d848fb09a720aaf511c7b01eb18577a115ba0b5d5d7bd"
        );
        Assert.isFalse(r, "Debe retornar falso al buscar el hashCAD");
    }

    function testItNumbersCADs() public {
        uint256 expected = 1;
        uint256 r = storageCAD.numbersCADs();
        Assert.equal(r, expected, "Debe retornar el valor de 1");
    }
}
