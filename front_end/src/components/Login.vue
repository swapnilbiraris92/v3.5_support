<!-- Copyright Asquared IoT Pvt. Ltd. 2019
     Asquared IoT Pvt. Ltd. Confidential Information
     Shared with Koninca Minolta Inc on March 08, 2019, under NDA between Asqaured IoT and Konica Minolta -->
<template>
  <div v-bind:class="{'langeng': ifeng, 'langjpy': ifjpy,}">
    <b-card class="col-xl-4 col-sm-6 mb-4 mx-auto" style="margin-top: 2%">
      <div class="text-center">   
        <h2><b>LOGIN</b></h2>
      </div>
      <p text="card-text">
        <hr>
        <form v-on:submit="login">
          <span style="padding-top: 1%">
            <b>{{ $t("Username")}}</b>
          </span>
          </br>
          <input type="text" name="email" class="form-control"/>
          </br>
          <span style="padding-top: 2%">
            <b> {{ $t("Password")}}</b>
          </span>
          </br>
          <input type="password" name="password" class="form-control" />
          </br>
          <div v-if="notLogin">
            <span class="text-danger"> {{$t("loginpagewarning")}}</span>
          </div>    
          <div class="text-center"  style="padding-top: 1%">
            <input class="btn btn-primary" type="submit" value="Login" />
            <button class="btn tab-button btn-primary" v-on:click="lang" type="button">
             {{ $t("language")}}
            </button></br>
          </div>
        </form>
      </p>
    </b-card>
  </div>
</template>

<script>
  import router from "../router"
  import axios from "axios"
  import config from '../js/config.js';
  export default {
    name: "Login",
    data() {
    return {
      config: config,
      notLogin: false,
        ifjpy:true,
        ifeng:false,
    }
  },
    methods: {
      login: function (e) {
        e.preventDefault()
        let email = e.target.elements.email.value
        let password = e.target.elements.password.value
        let login = () => {
          let data = {
              email: email,
              password: password
          }
          axios.post("/api/login", data).then((response) => {
            this.notLogin = false;
            router.push("/dashboard")
          }).catch((errors) => {
            this.notLogin = true;
          }) 
        }
        login()
      },
      lang: function (e) {
        if (this.$i18n.locale === 'en'){
          this.$i18n.locale = 'ja';
          this.ifeng = false;
          this.ifjpy = true;
        } else {
          this.$i18n.locale = 'en';
          this.ifjpy = false;
          this.ifeng = true;
        }
        console.log(this.ifjpy, this.ifeng)


      },
    },
  }
</script>