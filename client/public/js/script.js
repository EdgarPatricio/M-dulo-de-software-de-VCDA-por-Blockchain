// Verificar el soporte de varias API de archivos.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    document.getElementsByName('inputfile').addEventListener('change',
    function() {
        var fr = new FileReader();
        fr.onload = function(){
          // Se guarda en una variable el resultado de la lectura
            var binary = fr.result;
            //console.log(binary);
  
            // Librería Cripto JS para obtener el hash 256
            var hash256_CDA = CryptoJS.SHA256(binary).toString();
            document.getElementById('output').value = hash256_CDA;
        }
  
        fr.readAsBinaryString(this.files[0]);
    });
  } else {
    alert('Las API de archivos no son totalmente compatibles con este navegador.');
  }