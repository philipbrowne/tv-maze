/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  // TODO: Make an ajax request to the searchShows api.  Remove
  // hard coded data.

  {
    const res = await axios.get(
      `http://api.tvmaze.com/search/shows?q=${query}`
    );
    const shows = [];
    res.data.forEach((item) => {
      console.log(item);
      const show = {};
      show.id = item.show.id;
      show.name = item.show.name;
      show.summary = item.show.summary;
      show.genre = item.show.genres[0];
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
  // return [
  //   {
  //     id: 1767,
  //     name: "The Bletchley Circle",
  //     summary: "<p><b>The Bletchley Circle</b> follows the journey of four ordinary women with extraordinary skills that helped to end World War II.</p><p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their normal lives, modestly setting aside the part they played in producing crucial intelligence, which helped the Allies to victory and shortened the war. When Susan discovers a hidden code behind an unsolved murder she is met by skepticism from the police. She quickly realises she can only begin to crack the murders and bring the culprit to justice with her former friends.</p>",
  //     image: "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  //   }
  // ]
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

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
           <h5 class="card-title">${show.name}</h5>
              <p class="card-text lead">${show.genre}</p>
             <p class="card-text">${show.summary}</p>
             <!-- Button trigger modal -->
            <button class="btn btn-primary btn-lg episode-btn" data-bs-toggle="modal" data-bs-target="#episodes">View Episodes</button>
           </div>
         </div>
       </div>
      `
      );

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
            <ul id="episodes-list">
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>`);
      $showsList.append($item);
    }
  }
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$('#search-form').on('submit', async function handleSearch(evt) {
  evt.preventDefault();

  let query = $('#search-query').val();
  if (!query) return;

  $('#episodes-area').hide();

  let shows = await searchShows(query);
  populateShows(shows);
});

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

$('.container').on('click', 'button.episode-btn', function (e) {
  const id = $(this).parent().parent().attr('data-show-id');
  const title = $(this).parent().parent().find('h5')[0].innerText;
  getEpisodes(id, title);
});

async function getEpisodes(id, title) {
  // TODO: get episodes from tvmaze
  //       you can get this by making GET request to
  //       http://api.tvmaze.com/shows/SHOW-ID-HERE/episodes
  // TODO: return array-of-episode-info, as described in docstring above
  $('#episodes-area').show();
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  const episodes = [];
  const $episodeList = $('#episodes-list');
  const episodeArea = document.getElementById('episodes-area');
  const $episodesLabel = $('#episodesLabel');
  $episodesLabel.text(title);
  const $episodeTitle = $('#eptitle');
  $episodeTitle.html(`<b>${title} - Episodes</b>`);
  res.data.forEach((item) => {
    const episode = {};
    const { name, number, summary, url, season } = item;
    episodes.push(episode);
    const newLI = document.createElement('LI');
    newLI.innerHTML = `<li class="episode">
    <a href="${url}" target="_blank"><b>S${season}EP${number} - ${name}</b></a><br></li>`;
    if (summary) {
      const epSummary = document.createElement('p');
      epSummary.innerHTML = summary;
      newLI.append(epSummary);
    }
    if (item.image !== null) {
      const newImg = document.createElement('img');
      newImg.src = item.image.medium;
      newLI.append(newImg);
    }
    $episodeList.append(newLI);
  });
}
