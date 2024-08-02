<template>
  <div>
    <div v-for="(item, index) in paramList" :key="index">
      <div v-for="(subItem, subIndex) in item.paramList" :key="subIndex">
        {{ item.name + ': ' + subItem.name }}
        <el-input v-model="subItem.default" v-if="subItem.uiType === 'input'">
        </el-input>
        <el-select v-model="subItem.default" multiple v-if="subItem.uiType === 'select'" placeholder="请选择">
          <el-option
            v-for="c in subItem.selectChoices"
            :key="c.code"
            :label="c.name"
            :value="c.code">
          </el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineEmits, defineProps } from 'vue';
const emitFunc = defineEmits(['update:value'])
const paramList = ref([
])

const Props = defineProps({
  value: {
    default: [],
    type: Array,
  },
  paramListValue: {
    type: Array,
  }
})
watch(() => Props.paramListValue,
  (val, o) => {
    if (val) {
      paramList.value = val
    }
  },
  {
    deep: true
  }
)


watch(() => paramList.value,
  (val, o) => {
    if (val) {
      emitFunc('update:value', val)
    }
  },
  {
    deep: true
  }
)


onMounted(() => {
  if (Props.paramListValue) {
    paramList.value = Props.paramListValue
  }

})


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.paramform-class {
  font-size: 12px;
  color: blue;
  height: 100%;
  margin-left: 2px;
  margin-right: 16px;
}


.input-form {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;


}
</style>