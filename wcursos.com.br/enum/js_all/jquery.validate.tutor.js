jQuery.validator.addMethod("minAge", function(value, element, min) {
    var today = new Date();
    var [day, month, year] = value.split('/');
    var isoFormattedStr = year + '-' + month + '-' + day;
    var birthDate = new Date(isoFormattedStr);

    var age = today.getFullYear() - birthDate.getFullYear();
    if (age > value+1) { return true; }
 
    var m = today.getMonth() - birthDate.getMonth();
 
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    return age >= min;
}, "Você não é tem idade suficiente");

jQuery.validator.addMethod("cpfcnpj", function(value, element) {

  var b=value.replace(/\D/g,""),c=0,d=0,e=0,f=0;
  if((11!==b.length&&14!==b.length)||"00000000000"===b)
      return!1;
  if(11==b.length) {
      for(i=1;i<=9;i++)
          c+=parseInt(b.substring(i-1,i))*(11-i);
      if(e=10*c%11,e>=10&&(e=0),e!==parseInt(b.substring(9,10)))
          return!1;
      for(i=1;i<=10;i++)
          d+=parseInt(b.substring(i-1,i))*(12-i);
      return f=10*d%11,f>=10&&(f=0),f===parseInt(b.substring(10,11))
  }
  if(14==b.length) {
      var c = b.substr(0, 12);
      var dv = b.substr(12, 2);
      var d1 = 0;
      for (i = 0; i < 12; i = i + 1) {
          d1 += c.charAt(11 - i) * (2 + (i % 8));
      }
      if (d1 == 0)
          return false;
      d1 = 11 - (d1 % 11);
      if (d1 > 9)
          d1 = 0;
      if (dv.charAt(0) != d1) {
          return false;
      }

      d1 *= 2;
      for (i = 0; i < 12; i = i + 1) {
          d1 += c.charAt(11 - i) * (2 + ((i + 1) % 8));
      }
      d1 = 11 - (d1 % 11);
      if (d1 > 9)
          d1 = 0;
      if (dv.charAt(1) != d1) {
          return false;
      }
      return true;
  }  
}, 'O CPF/CNPJ esta inválido');



jQuery.validator.addMethod("ehValor", function(value, element) {
    var sValor;
    sValor = value;
    sValor = sValor.replace(/[,]/gi, "");
    sValor = sValor.replace(/[.]/gi, "");
    if (ehNumero(sValor) == false) {
        return (false);
    }
    return true;
}, 'O valor digitado não é um valor válido.');
  
jQuery.validator.addMethod("validDate", function(value, element) {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;

  if (value.match(regex) === null) {
    return false;
  }

  const [day, month, year] = value.split('/');

  const isoFormattedStr = year + '-' + month + '-' + day;

  const date = new Date(isoFormattedStr);
  
  const timestamp = date.getTime();
  
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false;
  }

  return date.toISOString().startsWith(isoFormattedStr);
}, "Por favor entre com uma data válida DD/MM/YYYY");


  
jQuery.validator.addMethod("creditCardName", function(value, element) {
    value = value.replace('.', '');
    value = value.replace('.', '');
    value = value.replace('.', '');
    value = value.replace('.', '');
    var regexVisa = /^4[0-9]{12}(?:[0-9]{3})?/;
    var regexMaster = /^5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|(2720)[0-9]{12}/;
    var regexAmex = /^3[47]\d{4}/;
    var regexDiners = /^3(?:0[0-5]|[68][0-9])[0-9]{11}/;
    var regexDiscover = /^6(?:011|5[0-9]{2})[0-9]{12}/;
    var regexJCB = /^(?:2131|1800|35\d{3})\d{11}/;
    var regexHipercard = /^(?:3841[046]0|6(?:06282|37(?:095|5(?:68|99)|6(?:09|12))))/;
    var regexElo = /^(4(0117[89]|3(1274|8935)|5(1416|7(393|63[12])))|50(4175|6(699|7([0-6]\d|7[0-8]))|9\d{3})|6(27780|36(297|368)|5(0(0(3[1-35-9]|4\d|5[01])|4(0[5-9]|([1-3]\d|8[5-9]|9\d))|5([0-2]\d|3[0-8]|4[1-9]|[5-8]\d|9[0-8])|7(0\d|1[0-8]|2[0-7])|9(0[1-9]|[1-6]\d|7[0-8]))|16(5[2-9]|[67]\d)|50([01]\d|2[1-9]|[34]\d|5[0-8]))))/;

    if(regexVisa.test(value)){
        return true;
    }
    if(regexMaster.test(value)){
        return true;
    }
    if(regexAmex.test(value)){
        return true;
    }
    if(regexDiners.test(value)){
        return true;
    }
    if(regexDiscover.test(value)){
        return true;
    }
    if(regexJCB.test(value)){
        return true;
    }
    if(regexHipercard.test(value)){
        return true;
    }
    if(regexElo.test(value)){
        return true;
    }

    return false;  

}, "O número do cartão está inválido");

jQuery.validator.addMethod("creditCardNumber", function(value, element) {
    value = value.replace('.', '');
    value = value.replace('.', '');
    value = value.replace('.', '');
    value = value.replace('.', '');

    if (/[^0-9-\s]+/.test(value)) return false;

    var nCheck = 0, nDigit = 0, bEven = false;
    value = value.replace(/\D/g, "");

    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n),
              nDigit = parseInt(cDigit, 10);

        if (bEven) {
            if ((nDigit *= 2) > 9) nDigit -= 9;
        }

        nCheck += nDigit;
        bEven = !bEven;
    }

    return (nCheck % 10) == 0;

}, "O número do cartão está inválido");

jQuery.validator.addMethod("fullName", function(value, element, min) {

    const regex = /^(.){2,}\s(.){2,}$/;

    if (value.match(regex) === null) {
      return false;
    }
    
    return true;

}, "Nome inválido, coloque seu nome completo");
