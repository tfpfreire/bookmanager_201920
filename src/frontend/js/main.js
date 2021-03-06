const historyServiceURL = ''
const searchServiceURL = ''
const authenticationServiceURL = ''
const trackingServiceURL = ''
const statisticsServiceURL = ''

const insertSearchResult = (book,table) => {
  let row = document.createElement('tr');
  let year = document.createElement('td');
  year.innerHTML = book.year;
  row.appendChild(year);
  let title = document.createElement('td');
  title.innerHTML = book.title;
  row.appendChild(title);
  let author = document.createElement('td');
  author.innerHTML = book.author;
  row.appendChild(author);
  let rating = document.createElement('td');
  rating.innerHTML = book.averageRating;
  row.appendChild(rating);
  let cover = document.createElement('td');
  let img = document.createElement('img');
  img.src = book.thumbnail_url;
  cover.appendChild(img)
  row.appendChild(cover);

  if(sessionStorage.getItem('token')){
    let trackTD = document.createElement('td');
    let trackButton = document.createElement('button');
    trackButton.innerHTML = 'Track';
    trackButton.classList.add('btn');
    trackButton.classList.add('btn-primary');
    trackButton.addEventListener('click',async (e)=>{
      e.preventDefault();
      const result = await axios.post(trackingServiceURL+'/api/books',book);
      console.log(result.data);
      if(result.status == 200) {
        alert("Book tracked");
      }
    })
    trackTD.appendChild(trackButton);
    row.appendChild(trackTD);
  }

  table.appendChild(row);
}


const insertHistoryResult = (result, tableResults, tableSearch) => {
  let tbodyResults = tableResults.querySelector('tbody');
  let row = document.createElement('tr');
  let date = document.createElement('td');
  date.innerHTML = moment(result.date).format('YYYY/MM/DD');
  row.appendChild(date);
  let terms = document.createElement('td');
  terms.innerHTML = result.query;
  row.appendChild(terms);
  let numberOfResults = document.createElement('td');
  numberOfResults.innerHTML = result.data.length;
  row.appendChild(numberOfResults);
  let buttonTD = document.createElement('td');
  let button = document.createElement('button');
  button.innerHTML = "Show";
  //button.setAttribute('data-index');
  button.addEventListener('click',(event)=>{
    event.preventDefault();
    let tbody = tableSearch.querySelector('tbody');
    tbody.innerHTML = '';
    for(let book of result.data){
      insertSearchResult(book,tbody);
    }
    tableSearch.style.display = 'block';
  });
  buttonTD.appendChild(button);
  row.appendChild(buttonTD);
  tbodyResults.appendChild(row);
}

const searchListener = (e) => {
  e.preventDefault();
  let searchTerms = document.querySelector("#search").value;
  
  axios.post(searchServiceURL+'/api/search',{search:searchTerms})
  .then(response => {
    console.log(response.data);
    let table = document.querySelector('#search_results');
    let tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    for(let book of response.data){
      insertSearchResult(book,tbody);
    }
    table.style.display = 'block';
  })
  .catch(error => {
    console.log(error)
  })
}

const populateHistory = async () => {
  let historyResults = await axios.get(historyServiceURL+'/api/history');
  if(historyResults){
    let tableResults = document.querySelector('#history_table');
    let tableSearch = document.querySelector('#search_results');
    for(let result of historyResults.data){
      insertHistoryResult(result,tableResults,tableSearch);
    }
  }
}

const loginListener = (e) => {
  e.preventDefault();
  let data = {
    username: document.querySelector('#username').value,
    password: document.querySelector('#password').value
  }
  axios.post(authenticationServiceURL+'/api/signin',data)
    .then(response=>{
      sessionStorage.setItem('token',response.data.token);
      location.reload(false);
    }).catch(error=>{console.log(error)});
}

(()=>{
  console.log("JS Loaded");
 
  let token = sessionStorage.getItem('token');
  if(token){
    axios.defaults.headers.common['Authorization'] = 'bearer '+ token;
  }

  let search_form = document.querySelector("#search_form");
  if(search_form){
    search_form.addEventListener('submit',searchListener);
  }

  let history_results = document.querySelector('#history_table');
  if(history_results){
    populateHistory();
  }

  let loginForm = document.querySelector("form#login");
  let logoutForm = document.querySelector('form#logout');
  if(loginForm){
    let token = sessionStorage.getItem('token');
    if(token){
      loginForm.style.display = 'none';
      logoutForm.style.display = 'block';
    } else {
      logoutForm.style.display = 'none';
      loginForm.style.display = 'block';
    }
    loginForm.addEventListener('submit',loginListener);
    logoutForm.addEventListener('submit',(e)=>{
      sessionStorage.removeItem('token');
      location.reload(false);
    });
  }

})();
