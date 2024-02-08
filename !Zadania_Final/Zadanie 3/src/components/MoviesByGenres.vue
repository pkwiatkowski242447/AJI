<script setup>
import {useMoviesStore} from "@/stores/UseMoviesStore";
import {filter, flatten, includes, map, slice, sortBy, uniq} from "lodash";

const moviesStore = useMoviesStore();

// Ensure getMovies returns a valid array
const movies = moviesStore.getMovies || [];

// Filter out movies with an empty cast
const moviesWithGenres = filter(movies, (movie) => movie.genres && movie.genres.length > 0);

const maxMoviesToShow = 100;
const slicedMovies = slice(moviesWithGenres, 1, maxMoviesToShow);

const genresAll = sortBy(uniq(flatten(map(slicedMovies, 'genres'))));
</script>

<template>
  <div>
    <b-list-group v-for="genre in genresAll" :key="genre">
      <div>
        <h5 class="pt-4"><b class="font-weight-bold">{{ genre }}</b></h5>
        <b-list-group-item
            v-for="(movie, index) in sortBy(filter(slicedMovies, (m) => includes(m.genres, genre)), 'title')"
            :key="movie.title"
        >
          <b class="font-weight-bold">{{ index + 1 }}.</b> {{ movie.title }} - {{ movie.year }}
        </b-list-group-item>
      </div>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'MoviesByGenres' //has to be 2 or more words for some reason
};
</script>

<style scoped>
</style>
