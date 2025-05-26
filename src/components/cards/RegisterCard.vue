<script setup>
import { ref } from 'vue';
import BaseButton from '../buttons/BaseButton.vue';
const emit = defineEmits(['register']);

const name = ref('');
const email = ref('');
const gender = ref('');
const password = ref('');

const registerUser = () => {
  if (name.value && email.value && gender.value && password.value) {
    emit('register', {
      name: name.value.trim(),
      email: email.value.trim(),
      gender: gender.value,
      password: password.value
    });
    // Reset form
    name.value = '';
    email.value = '';
    gender.value = '';
    password.value = '';
  }
};
</script>

<template>
  <div class="card register-card">
    <div class="card-header">
      <i class="bi-person-plus-fill register-icon"></i>
      <h2>Tukarbaca Register</h2>
    </div>
    <div class="card-body">
      <form id="register-form" @submit.prevent="registerUser">
        <div class="form-floating mb-3">
          <input type="text" class="form-control" id="name" placeholder="Nama Lengkap" v-model="name" required>
          <label for="name"><i class="bi-person-plus-fill me-2"></i>Nama Lengkap</label>
        </div>
         <div class="form-floating mb-3">
          <select class="form-select" id="gender" v-model="gender" required>
            <option value="" disabled>Pilih jenis kelamin</option>
            <option value="Male">Laki-laki</option>
            <option value="Female">Perempuan</option>
          </select>
          <label for="gender"><i class="bi-gender-ambiguous me-2"></i>Jenis Kelamin</label>
        </div>
        <div class="form-floating mb-3">
          <input type="email" class="form-control" id="email" placeholder="nama@contoh.com" v-model="email" required>
          <label for="email"><i class="bi-envelope-fill me-2"></i>Email</label>
        </div>
        <div class="form-floating mb-3">
          <input type="password" class="form-control" id="password" placeholder="Password" v-model="password" required>
          <label for="password"><i class="bi-lock-fill me-2"></i>Password</label>
        </div>
        <BaseButton type="primary" class="w-100" @click="registerUser">Daftar</BaseButton>
      </form>
      <div class="login-link mt-3 text-center">
        <p>Sudah punya akun? <router-link to="/login">Login</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-card {
  max-width: 400px;
  width: 100%;
  padding: 0;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #4e73df;
  color: white;
  text-align: center;
  padding: 25px;
  border-bottom: none;
}

.card-header h2 {
  margin-bottom: 0;
  font-weight: 700;
}

.card-body {
  padding: 30px;
}

.form-floating label {
  color: #6c757d;
}

.form-control:focus, .form-select:focus {
  border-color: #4e73df;
  box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
}

.login-link a {
  color: #4e73df;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

.register-icon {
  font-size: 60px;
  margin-bottom: 15px;
}
</style>
