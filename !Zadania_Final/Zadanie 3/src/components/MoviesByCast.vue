<script setup>
import { useMoviesStore } from "@/stores/UseMoviesStore";
import { filter, flatten, includes, map, slice, uniq, sortBy } from "lodash";

const moviesStore = useMoviesStore();

// Ensure getMovies returns a valid array
const movies = moviesStore.getMovies || [];

// Filter out movies with an empty cast
const moviesWithCast = filter(movies, (movie) => movie.cast && movie.cast.length > 0);

const maxMoviesToShow = 100;
const slicedMovies = slice(moviesWithCast, 1, maxMoviesToShow);

const actors = sortBy(uniq(flatten(map(slicedMovies, 'cast'))));
</script>

<template>
  <div>
    <b-list-group v-for="actor in actors" :key="actor">
      <div>
        <h5 class="pt-4"><b class="font-weight-bold">{{ actor }}</b></h5>
        <b-list-group-item
            v-for="(movie, index) in sortBy(filter(slicedMovies, (m) => includes(m.cast, actor)), 'title')"
            :key="movie.title"
        >
          <b class="font-weight-bold">{{ index + 1 }}.</b> {{ movie.title }} - {{ movie.year }}.
          <b v-if="movie.genres && movie.genres.length > 0" class="font-weight-bold">{{ movie.genres.length > 1 ? 'Genres' : 'Genre' }}:</b>
          {{ movie.genres.join(', ') }} <!-- Makes it so it displays "genre" instead of "genres" whenever the movie only has 1 genre" -->
        </b-list-group-item> <!--`>Join removes the square brackets and quotation marks -->
      </div>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'MoviesByCast' //has to be 2 or more words for some reason
};
</script>

<style scoped>
</style>
