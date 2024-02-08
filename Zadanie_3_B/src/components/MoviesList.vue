<script setup>
import {useMoviesStore} from "@/stores/UseMoviesStore";
import {slice} from 'lodash'
import {ref} from 'vue';

const movies = useMoviesStore();

let numberOfMoviesShownAtATime = 10;  //start with 10 movies shown to the user
let step = 10;

let moviesShownToUser = ref(slice(movies.getMovies, 0, numberOfMoviesShownAtATime));

function showMoreMovies() {
  numberOfMoviesShownAtATime += step;
  moviesShownToUser.value = slice(movies.getMovies, 0, numberOfMoviesShownAtATime);
}

movies.$subscribe(()=>{
  numberOfMoviesShownAtATime = 10;
  moviesShownToUser.value = slice(movies.getMovies,0, 10);
})

</script>

<template>
  <div>
    <b-table hover :items="moviesShownToUser" :fields="fields">
      <template #cell(title)="movie">
        {{ movie.item.title }}
      </template>
      <template #cell(year)="movie">
        {{ movie.item.year }}
      </template>
      <template #cell(cast)="movie">
        <ul class="custom-list">
          <li v-for="person in movie.item.cast" :key="person">{{ person }}</li>
        </ul>
      </template>
      <template #cell(genres)="movie">
        <span v-for="(genre, index) in movie.item.genres" :key="genre">
          {{ genre }}
          <span v-if="index < movie.item.genres.length - 1">| </span>
        </span>
      </template>
    </b-table>
    <b-button @click="showMoreMovies()" block variant="info" class="centered-button" >Pokaż Kolejnych 10 Filmów</b-button>
  </div>
</template>

<script>
export default {
  name: 'MoviesList',
  data() {
    return {
      fields: [
        {key: 'title', label: 'Title'},
        {key: 'year', label: 'Production Year'},
        {key: 'cast', label: 'Cast'},
        {key: 'genres', label: 'Genres'},
      ]
    }
  }
}
</script>

<style scoped>
  .centered-button {
   width: 103%;
   margin-left: -1.5%
  }
  .custom-list {
    list-style-type: none;
    text-align: left;
    padding-left: 0;
  }
</style>

