<script setup>
import {computed, ref, watch} from 'vue';
import {split, toLower} from "lodash";
import {useMoviesStore} from "@/stores/UseMoviesStore";

const movies = useMoviesStore();
const title = ref('');
const productionYearFrom = ref('');
const productionYearTo = ref('');
const cast = ref('');

const minProductionYearTo = computed(() => {
  return productionYearFrom.value !== '' ? productionYearFrom.value : 1900;
});

watch(productionYearFrom, (newVal) => {
  if (productionYearTo.value < newVal) {
    productionYearTo.value = newVal;
  }
});

function userFiltered() {
  let filteredTitle = toLower(title.value);
  let filteredProductionYearFrom = productionYearFrom.value;
  let filteredProductionYearTo = productionYearTo.value;
  let filteredCast = cast.value === "" ? null : split(cast.value, ',');
  movies.$patch({
    title: filteredTitle,
    productionYearFrom: filteredProductionYearFrom,
    productionYearTo: filteredProductionYearTo,
    cast: filteredCast
  })
}
</script>

<template>
  <b-form>
    <b-form-group label="Tytuł" label-for="formTitle">
      <b-form-input
          v-model="title"
          type="text"
          id=formTitle
          class="form-control"
          placeholder="Podaj tytuł lub fragment tytułu filmu"/>
    </b-form-group>
    <b-form-group label="Rok produkcji od:" label-for="formProductionYearFrom" label-cols-sm="4">
      <b-form-input
          v-model="productionYearFrom"
          type="number"
          id=formProductionYearFrom
          class="form-control"
          placeholder="Liczba naturalna z przedziału 1900-2019"
          min="1900"
          max="2019"
      />
    </b-form-group>
    <b-form-group label="Rok produkcji do:" label-for="formProductionYearTo" label-cols-sm="4">
      <b-form-input
          v-model="productionYearTo"
          type="number"
          id=formProductionYearTo
          class="form-control"
          placeholder="Liczba naturalna z przedziału 1900-2019"
          :min="minProductionYearTo"
          max="2019"
      />
    </b-form-group>
    <b-form-group label="Obsada" label-for="formCast">
      <b-form-input
          v-model="cast"
          type="text"
          id="formCast"
          class="form-control"
          placeholder="Imię i nazwisko"/>
    </b-form-group>
    <b-button @click="userFiltered()"
              block variant="info"
              style="width: 103%; margin-left: -1.5%">Szukaj
    </b-button>
  </b-form>
</template>

<script>
export default {
  name: 'FilteringMovies'
}
</script>

<style scoped>
</style>