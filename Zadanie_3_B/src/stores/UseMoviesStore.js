import {defineStore} from "pinia";
import data from './../data/movies.json';
import {filter, includes, intersection} from "lodash";

export const useMoviesStore = defineStore('movies', {
    state: () => ({
        movies: data,
        title: "",
        productionYearFrom: "",
        productionYearTo: "",
        cast: null
    }),
    // --- This getter returns the movie list sorted by date by default ---
    getters: {
        getMovies() {
            if (this.title === "" && this.productionYearFrom === "" && this.productionYearTo === "" && this.cast === null) {
                return this.movies;
            }

            return filter(this.movies, (movie) => {
                if (this.title !== "" && !includes(movie.title.toLowerCase(), this.title.toLowerCase())) {
                    return false;
                }
                if (this.productionYearFrom !== "" && movie.year < this.productionYearFrom) {
                    return false;
                }
                if (this.productionYearTo !== "" && movie.year > this.productionYearTo) {
                    return false;
                }
                return !(this.cast !== null && intersection(this.cast, movie.cast).length !== this.cast.length);
            });
        },
    }
});