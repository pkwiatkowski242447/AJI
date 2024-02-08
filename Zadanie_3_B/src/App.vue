<template>
  <div id="app">
    <b-container>
      <h1 class="pt-3 custom-h1">Baza filmów</h1>
      <FilteringMovies/>
      <MoviesList/>
      <h1 class="pt-3 custom-h1">Filmy wg gatunku</h1>
      <MoviesByGenres/>
      <h1 class="pt-3 custom-h1">Filmy wg obsady</h1>
      <MoviesByCast/>
    </b-container>
  </div>
</template>

<script>

import MoviesByCast from "@/components/MoviesByCast.vue";
import MoviesByGenres from "@/components/MoviesByGenres.vue";
import MoviesList from "@/components/MoviesList.vue";
import FilteringMovies from "@/components/FilteringMovies.vue";

export default {
  name: 'App',
  components: {
    FilteringMovies,
    MoviesList,
    MoviesByGenres,
    MoviesByCast
  }
}
</script>

<style>

// Font family is taken from sample index.html file
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #212529;
  margin-top: 30px;
}

.custom-h1 {
  font-size: 44px;
}
</style>
