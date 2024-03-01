const API_KEY = `2r0uWdZQtrPmhz0X6LdIUJCI9oierX%2FHiSG2judZYpMdbDlewh%2BeiUKqFIz9%2BGFItTlAr7OIczip2DbaDybkRQ%3D%3D`;
let stocksTotalList = [];
let stocksGraphList = [];
let stocksDetailList = [];
let stockPrices = [];

const stockTotalUrl = new URL(`https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=${API_KEY}&resultType=json&pageNo=1&numOfRows=50`);
let stockGraphUrl = new URL(`https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=${API_KEY}&resultType=json&pageNo=1&numOfRows=50&beginBasDt=20240101`);

const getStock = async (urlStr) => {
  const url = new URL(urlStr);
  const response = await fetch(url);
  const data = await response.json();

  return data.response.body.items.item;
}

function createURL(name){
  
  return `https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=${API_KEY}&resultType=json&itmsNm=${name}&beginBasDt=20240101`;
}

const stockRender = () => {
  let stocksHTML = stocksTotalList.map((stocks) => {
    
      const date = `${stocks.basDt}`;
      const formattedDate = `${date.substr(4, 2)}.${date.substr(6, 2)}`;

      let fltRtColor = '';
      if (stocks.fltRt > 0) {
        fltRtColor = 'red';
        stocks.fltRt = `+${stocks.fltRt}`;
      } else if (stocks.fltRt == 0) {
        fltRtColor = 'gray';
      }

      
        const price = stocks.mkp;
        const timestamp = stocks.basDt;
        const itemName = stocks.itmsNm;

        stocksGraphList.push(getStock(stockGraphUrl+'&itmsNm'+itemName));
  
        stockPrices.push({ price, timestamp, itemName});
        

      return `          
      <a href="stock-detail.html?stockName=${itemName}">
      <div class="stock-info">
      <div class="stock-market">
      <strong>${stocks.mrktCtg}</strong>
      </div>
      <div class="stock-title">
      <span>${itemName}</span>
      </div>
      
      <div class="stock-price">
      <h1>${Number(stocks.mrktTotAmt).toLocaleString('ko-KR')}</h1>
      </div>
      
      <div class="fluctuation-rate">
      <span style="color: ${fltRtColor};">${stocks.fltRt}%</span>
      </div>
      
      <div class="stock-date">
      ${formattedDate}
      </div>
      </div>

      <div id="stock-graph-${stocks.itmsNm.replace(/\s/g,'')}" class="stock-graph">
        <canvas id="stock-chart-${stocks.itmsNm.replace(/\s/g,'')}" class="stock-chart"></canvas>
      </div>
      </a>`;
    }).join('');

  document.getElementById('carousel').innerHTML = stocksHTML;


  stocksGraphList.forEach((stock) => {

    const chartData = {
      labels: stockPrices.map((stock) => Number(stock.timestamp)),
      datasets: [
        {
          label: 'stock-price',
          data: stockPrices.map((stock) => Number(stock.price)),
          borderWidth: 1.5,
          pointRadius: 0,
        },
      ],
    };

    const chartOptions = {
      plugins: {
        legend: {
          display: false,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            display: false,
          },
        },
        y: {
          beginAtZero: false,
        },
      },
      tooltips: {
        mode: 'nearest',
        intersect: true,
      },
      hover: {
        mode: 'nearest',
        intersect: true,
      },
    };

    const ctx = document.getElementById(`stock-chart-${stock.itmsNm.replace(/\s/g, '')}`).getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });
  });
};

const fetchData = async () => {
  stocksTotalList = await getStock(stockTotalUrl);
  stocksGraphList = await getStock(stockGraphUrl);

  stockRender();
};

fetchData();