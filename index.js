$(document).ready(() => {
  ((context) => {
    const api = context.api
    const ui = context.ui
    const currencies = [
      'USD ($)', 'CAD ($)', 'EUR (€)', 'CNY (¥)', 'KRW (₩)', 'GBP (£)', 'JPY (¥)'
    ];

    currencies.sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    currencies.reverse();

    let cryptoData = []
    let fromHasCrypto = true;
    let fromHasFiat = true;
    let toHasCrypto = true;
    let toHasFiat = true;
    
    /*Function that will populate currencies*/
    function populateCurrencies(cryptoData) {
      ui.fromCurrency.innerHTML = null;
      ui.toCurrency.innerHTML = null;
          debugger;
      //Getting list of cryptoCoinNames
      var cryptoCoinNames = [];

      cryptoData.forEach(function(crypto) {
        var cryptoDisplayName = crypto.name + " (" + crypto.symbol + ")";
        cryptoCoinNames.push(cryptoDisplayName);
      });

      cryptoCoinNames.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
  
      cryptoCoinNames.reverse();

      //adding crypto to both boxes if necessary
      if (fromHasCrypto)
      {
        cryptoCoinNames.forEach(function(cryptoname) {
          const fromcryptocurrency = document.createElement('option');
          fromcryptocurrency.text = fromcryptocurrency.value = cryptoname;
          ui.fromCurrency.add(fromcryptocurrency, 0);
        });
      }

      if (toHasCrypto)
      {
        cryptoCoinNames.forEach(function(cryptoname) {
          const tocryptocurrency = document.createElement('option');
          tocryptocurrency.text = tocryptocurrency.value = cryptoname;
          ui.toCurrency.add(tocryptocurrency, 0);
        });
      }

      //adding fiat to both boxes if necessary
      if (fromHasFiat)
      {
        currencies.forEach(function(currency) {
          const fromfiatcurrency = document.createElement('option');
          fromfiatcurrency.text = fromfiatcurrency.value = currency;
          ui.fromCurrency.add(fromfiatcurrency, 0);
        });
      }

      if (toHasFiat)
      {
        currencies.forEach(function(currency) {
          const tofiatcurrency = document.createElement('option');
          tofiatcurrency.text = tofiatcurrency.value = currency;
          ui.toCurrency.add(tofiatcurrency, 0);
        });
      }
      
      //adding default selected options
      const selectFromCurrencyOption = document.createElement('option');
      selectFromCurrencyOption.text = selectFromCurrencyOption.value = 'Select Start Currency';
      ui.fromCurrency.add(selectFromCurrencyOption, 0);

      const selectToCurrencyOption = document.createElement('option');
      selectToCurrencyOption.text = selectToCurrencyOption.value = 'Select Start Currency';
      ui.toCurrency.add(selectToCurrencyOption, 0);
      
      ui.fromCurrency.selectedIndex = "0";
      ui.toCurrency.selectedIndex = "0";
    }

    function RefreshCryptoCoins() {
      debugger;
      return fetch(api.tokenCoinmarketCapPrefix)
        .then(resp => resp.json())
        .then(data => {
          cryptoData = data,
          populateCurrencies(data)
        })
    }
    
    /*Function that converts amount in specified currency to USD*/
    function convertToUSD(amount, currency) {
        const exchangerate = currency === "USD" ? 1 : fiatData.rates[currency];
        const usdamount = amount / exchangerate;
      
        //Convert amount to Ether
        return fetch(api.ethereumCoinmarketCap)
          .then(resp => resp.json())
          .then(data => {
            return (usdamount / data[0].price_usd)
        })
    }
    
    /*Function that will calculate tokens */
    function onCalculateClick () {
      ui.resultBox.value = 'Loading...'
      let fiatInvestmentAmt = ui.amountBox.value
      let missingSelection = !ui.icosBox.selectedIndex || !ui.currencyBox.selectedIndex || !ui.roundBox.selectedIndex

      if (missingSelection || (fiatInvestmentAmt <= 0)) {
        alert("Oops! Could not Calculate Tokens. Please input all fields in the calculator and make sure the investment amount is a positive number then try again. Click OK to continue.");
        ui.resultBox.value = ''
        return;
      }
      else {
        let ico = ui.icosBox.options[ui.icosBox.selectedIndex].text;
        let isPresale = false;
        let currency = ui.currencyBox.options[ui.currencyBox.selectedIndex].text;
        currency = currency.substring(0, currency.indexOf(' ')).trim();
        if (ui.roundBox.selectedIndex === 2) {
          isPresale = true;
        };

        convertFiatToEther(fiatInvestmentAmt, currency)
          .then(etherCount => {
            const result = calculateTokenCount(etherCount, ico, isPresale)
            if (result) {
              ui.resultBox.value = `${result.tokenCount} ${result.tokenName} Tokens`
            } else {
              ui.resultBox.value = 'Please try again.'
            }
          }).catch(err => {
            ui.resultBox.value = 'Please try again.'
          })
      }
    }
    
    RefreshCryptoCoins()

    ui.calculateButton.addEventListener('click', onCalculateClick)
    //ui.fromCryptoCheckboxChanges.addEventListener('change', onfromCryptoSelectionChange)
    //ui.fromFiatCheckboxChanges.addEventListener('change', onfromFiatSelectionChange)
    //ui.toCryptoCheckboxChanges.addEventListener('change', ontoCryptoSelectionChange)
    //ui.toFiatCheckboxChanges.addEventListener('change', ontoFiatSelectionChange)
    
  })({
    api: {
      tokenCoinmarketCapPrefix: 'https://api.coinmarketcap.com/v1/ticker/?limit=10000000',
      googleICOSheet: 'https://spreadsheets.google.com/feeds/list/1y_Rg6i0Yu_uqJ8EqPbwWqlA75f-w84aH3nJ_QiKrbsQ/1/public/values?alt=json-in-script&callback=cb'
    },
    ui: {
      fromCurrency: document.querySelector('#FromCurrency'),
      toCurrency: document.querySelector('#ToCurrency'),
      amountBox: document.querySelector('#investmentamount'),
      resultBox: document.querySelector('#tokensresult'),
      calculateButton: document.querySelector('#startTokenCalc'),
      fromCryptosCheckBox: document.querySelector('#fromcryptos'),
      fromfiatCheckBox: document.querySelector('#fromfiat'),
      toCryptosCheckBox: document.querySelector('#tocryptos'),
      toCryptosCheckBox: document.querySelector('#tofiat'),
    }
  })
})