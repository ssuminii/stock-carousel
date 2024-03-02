const API_KEY = `2r0uWdZQtrPmhz0X6LdIUJCI9oierX%2FHiSG2judZYpMdbDlewh%2BeiUKqFIz9%2BGFItTlAr7OIczip2DbaDybkRQ%3D%3D`;
let stocksTotalList = [];
let stocksGraphList = [];
let stocksGraphList2 = [];
let stocksDetailList = [];
let stockPrices = [];
let stockItems = [];

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

function setStockGraphUrl(name){
  return `https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=${API_KEY}&resultType=json&pageNo=1&numOfRows=50&beginBasDt=20240101&itmsNm=${name}`;
}


const stockRender = async () => {
  let stocksHTML = stocksTotalList.map(async (stocks) => {
    const date = `${stocks.basDt}`;
    const formattedDate = `${date.substr(4, 2)}.${date.substr(6, 2)}`;

    let fltRtColor = '';
    if (stocks.fltRt > 0) {
      fltRtColor = 'red';
      stocks.fltRt = `+${stocks.fltRt}`;
    } else if (stocks.fltRt == 0) {
      fltRtColor = 'gray';
    }

    const itemName = stocks.itmsNm;
    const stockGraphUrl = setStockGraphUrl(itemName);

    stockItems = await getStock(stockGraphUrl);
    let timestampList = [];
    let priceList = [];
    stockItems.map((s) => {
      timestampList.push(`${s.basDt}`);
      priceList.push(Number(`${s.mkp}`));
    });

    stockPrices.push({ itemName, priceList, timestampList });

    return `
      <a href=#>
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
        <div id="stock-graph-${stocks.itmsNm.replace(/\s/g, '')}" class="stock-graph">
          <canvas id="stock-chart-${stocks.itmsNm.replace(/\s/g, '')}" class="stock-chart"></canvas>
        </div>
      </a>`;
  });

  stocksHTML = await Promise.all(stocksHTML);
  document.getElementById('carousel').innerHTML = stocksHTML.join('');

  stockPrices.forEach((stock) => {
    const chartData = {
      labels: stock.timestampList,
      datasets: [
        {
          label: 'stock-price',
          data: stock.priceList,
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

    const ctx = document.getElementById(`stock-chart-${stock.itemName.replace(/\s/g, '')}`).getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });
  });
};


const fetchData = async () => {
  stocksTotalList = await getStock(stockTotalUrl);
  stockRender();
};

fetchData();