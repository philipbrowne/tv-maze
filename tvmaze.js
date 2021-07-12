async function searchShows(query) {
  {
    const res = await axios.get(
      `https://api.tvmaze.com/search/shows?q=${query}`
    );
    const shows = [];
    res.data.forEach((item) => {
      const show = {};
      console.log(item);
      show.id = item.show.id;
      show.name = item.show.name;
      show.summary = item.show.summary;
      show.genre = item.show.genres[0];
      show.url = item.show.url;
      if (show.genre === undefined) {
        show.genre = '';
      }
      if (item.show.image !== null && item.show.image.medium) {
        show.image = item.show.image.medium;
      } else show.image = '';
      shows.push(show);
    });
    return shows;
  }
}

function populateShows(shows) {
  {
    const $showsList = $('#shows-list');
    $showsList.empty();

    for (let show of shows) {
      let $item = $(
        `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
           <img class="card-img-top" src="${show.image}">  
           <a href="${show.url}" target="_blank"><h5 class="card-title">${show.name}</h5></a>
            <p class="card-text lead">${show.genre}</p>
             <p class="card-text">${show.summary}</p>
             <!-- Button trigger modal -->
            <button class="btn btn-primary btn-lg episode-btn" data-bs-toggle="modal" data-bs-target="#episodes">View Episodes</button>
           </div>
         </div>
       </div>
      `
      );
      $showsList.append($item);
      makeEpisodeModal();
    }
  }
  document.getElementById('search-query').value = '';
}

function makeEpisodeModal() {
  const $episodesArea = $('#episodes-area');
  $episodesArea.html(`
      <div class="modal fade" id="episodes" tabindex="-1" aria-labelledby="episodesLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="episodesLabel">Episodes</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="lead" id="eptitle">Episodes</p>
            <ol id="episodes-list">
            </ol>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>`);
}

$('#search-form').on('submit', async function handleSearch(evt) {
  evt.preventDefault();

  let query = $('#search-query').val();
  if (!query) return;

  $('#episodes-area').hide();

  let shows = await searchShows(query);

  populateShows(shows);
});

$('.container').on('click', 'button.episode-btn', function (e) {
  let id = $(this).parent().parent().attr('data-show-id');
  console.log(id);
  const title = $(this).parent().parent().find('h5')[0].innerText;
  getEpisodes(id, title);
});

async function getEpisodes(id, title) {
  $('#episodes-area').show();
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  populateEpisodes(res.data, title);
}

function populateEpisodes(episodes, title) {
  const $episodeList = $('#episodes-list');
  episodePage(title);
  episodes.forEach((item) => {
    const { name, number, summary, url, season } = item;
    let $newItem = $(
      `<li class="episode"><a href="${url}" target="_blank">Season ${season}, Ep. ${number} - ${name}</a><br></li>`
    );

    $episodeList.append($newItem);
    if (summary) {
      $newItem.append(summary);
    }
    if (item.image !== null) {
      const newImg = document.createElement('img');
      newImg.src = item.image.medium;
      $newItem.append(newImg);
    }
  });
}

function episodePage(title) {
  const $episodeList = $('#episodes-list');
  $episodeList.html('');
  const episodeArea = document.getElementById('episodes-area');
  const $episodesLabel = $('#episodesLabel');
  $episodesLabel.text(title);
  const $episodeTitle = $('#eptitle');
  $episodeTitle.html(`<b>${title} - Episodes</b>`);
}
