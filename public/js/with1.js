


var formsCollection = document.getElementsByTagName("form");

function currencyIden(formname){
	if(formname === "mpesaform" || formname === "airtelformke"){
		return "Ksh";
	}else if(formname === "airtelformug" || formname === "mtnform"){
		return "UGX";
	}else if(formname === ""){
	}else{
		return "TZSH";
	}
}

function listener(formname,currency){
	const usdvalue = formname.elements['amount'];
	const convertvalue = formname.elements['converted'];
	var Float;
	usdvalue.addEventListener('input', event=>{
		if(currency === "Ksh"){
		Float =(parseFloat(event.target.value)*143.60).toFixed(2);
		}else if(currency === "UGX"){
		Float =(parseFloat(event.target.value)*3732.51).toFixed(2);
		}else{
			Float =(parseFloat(event.target.value)*2334.00).toFixed(2);
		}
		convertvalue.textContent = currency.concat(" ").concat(Float.toString());
	});
}

function convert(){
	for(var i=0;i<formsCollection.length; i++){
		if(formsCollection[i].id ===""){}else{
		listener(formsCollection[i], currencyIden(formsCollection[i].id));
		}
	}
	
}

convert();

