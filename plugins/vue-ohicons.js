import Vue from "vue";

import { OhVueIcon, addIcons } from "oh-vue-icons";
import * as MdIcons from "oh-vue-icons/icons/md";

const Md = Object.values({ ...MdIcons });
addIcons(...Md);

Vue.component("v-icon", OhVueIcon);
