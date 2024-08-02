<script setup>
import {
  Management,
  Promotion,
  UserFilled,
  User,
  Crop,
  Files,
  EditPen,
  SwitchButton,
  CirclePlusFilled,
  House,
  Timer,
  View,
  Close
} from "@element-plus/icons-vue";
import { useUserStore } from "@/stores";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
const userStore = useUserStore();
const router = useRouter();

onMounted(() => {
  // userStore.getUser()
});

const handleCommand = async (key) => {
  if (key === "logout") {
    // 退出操作
    await ElMessageBox.confirm("确认要进行退出吗", "温馨提示", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消",
    });

    // 清除本地的数据 (token + user信息)
    userStore.removeToken();
    userStore.setUser({});
    router.push("/login");
  } else {
    // 跳转操作
    router.push(`/user/${key}`);
  }
};

const logout = async () => {
  await ElMessageBox.confirm("确认要进行退出吗", "温馨提示", {
    type: "warning",
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  });

  // 清除本地的数据 (token + user信息)
  userStore.removeToken();
  userStore.setUser({});
  router.push("/login");
}
</script>

<template>
  <!-- 
    el-menu 整个菜单组件
      :default-active="$route.path"  配置默认高亮的菜单项
      router  router选项开启，el-menu-item 的 index 就是点击跳转的路径

    el-menu-item 菜单项
      index="/article/channel" 配置的是访问的跳转路径，配合default-active的值，实现高亮
  -->
  <el-container>
  <el-menu
    active-text-color="#ffd04b"
    background-color="#545c64"
    :default-active="$route.path"
    text-color="#fff"
    router
    :ellipsis="false"
    mode="horizontal"
  >
    <el-menu-item index="/stock/overview">
      <el-icon>
        <House />
      </el-icon>
      <span>情绪总览</span>
    </el-menu-item>
    <el-sub-menu index="/select">
      <template #title>
        <el-icon>
          <Management />
        </el-icon>
        <span>策略选股</span>
      </template>
      <el-menu-item index="/stock/select">
        <el-icon>
          <Management />
        </el-icon>
        <span>实时数据选股</span>
      </el-menu-item>
      <el-menu-item index="/stock/select_by_hisory">
        <el-icon>
          <Management />
        </el-icon>
        <span>历史数据选股</span>
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item index="/stock/analysis">
      <el-icon>
        <Promotion />
      </el-icon>
      <span>买卖点分析</span>
    </el-menu-item>
    <el-sub-menu index="/backtrade">
      <!-- 多级菜单的标题 - 具名插槽 title -->
      <template #title>
        <el-icon>
          <Timer />
        </el-icon>
        <span>回测</span>
      </template>
      <!-- 展开的内容 - 默认插槽 -->
      <el-menu-item index="/backtrade/start">
        <el-icon>
          <Timer />
        </el-icon>
        <span>策略回测</span>
      </el-menu-item>
      <el-menu-item index="/backtrade/record">
        <el-icon>
          <Files />
        </el-icon>
        <span>回测记录</span>
      </el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="/user">
      <!-- 多级菜单的标题 - 具名插槽 title -->
      <template #title>
        <el-icon>
          <UserFilled />
        </el-icon>
        <span>个人中心</span>
      </template>
      <!-- 展开的内容 - 默认插槽 -->
      <el-menu-item index="/user/profile">
        <el-icon>
          <User />
        </el-icon>
        <span>账户信息</span>
      </el-menu-item>
      <el-menu-item index="/user/addinfo">
        <el-icon>
          <CirclePlusFilled />
        </el-icon>
        <span>信息录入</span>
      </el-menu-item>
      <el-menu-item index="/user/resetpasswd">
        <el-icon>
          <EditPen />
        </el-icon>
        <span>重置密码</span>
      </el-menu-item>
      <el-menu-item @click="logout">
        <el-icon>
          <Close />
        </el-icon>
        <span>退出登录</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
  <el-main>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
      <!-- <component :is="Component" v-if="Component.meta.keepAlive" /> -->
    </router-view>
  </el-main>
  <el-footer>Smart-Stock ©2023 Created by Smart-Stock-Team</el-footer>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;

  .el-aside {
    padding-top: 100px;
    background-color: #545c64;

    .el-menu {
      border-right: none;
    }
  }

  .el-header {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .el-dropdown__box {
      display: flex;
      align-items: center;

      .el-icon {
        color: #999;
        margin-left: 10px;
      }

      &:active,
      &:focus {
        outline: none;
      }
    }
  }

  .el-menu-item {
    width: 2px;
  }
  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
  }
}
</style>
