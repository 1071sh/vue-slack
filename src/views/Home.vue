<template>
    <div class="flex h-screen">
        <div class="w-1/5 bg-gray-800 text-white pt-3 px-4">
            <div class="flex justify-between items-center">
                <h1 class="font-semibold text-xl leading-tight">Slack Clone</h1>
                <Notification />
            </div>
            <div class="flex items-center">
                <span class="bg-yellow-400 rounded-full w-3 h-3 mr-2"></span>
                <span class="opacity-50">{{ user.email }}</span>
            </div>
            <div class="mt-5 flex justify-between items-center">
                <div class="font-bold opacity-50 text-lg">チャンネル</div>
                <div
                    class="z-10 fixed top-0 left-0 h-full w-full flex items-center justify-center"
                    style="background-color:rgba(0,0,0,0.5)"
                    v-show="channelModal"
                    @click="closeChannelModal"
                >
                    <div
                        class="z-20 bg-white text-gray-900 w-1/3 rounded-md"
                        v-on:click.stop
                    >
                        <div class="flex flex-col p-6">
                            <div class="flex justify-between items-center">
                                <h2 class="text-3xl font-black leading-loose">
                                    チャンネルを作成する
                                </h2>
                                <span
                                    @click="closeChannelModal"
                                    class="text-4xl"
                                >
                                    ×
                                </span>
                            </div>
                            <p>
                                チャンネルはチームがコニュニケーションを取る場所です。特定のトピックに基づいてチャンネルを作ると良いでしょう。(例:
                                #マーケティング)
                            </p>
                            <div class="mt-8 font-semibold">名前</div>
                            <div class="my-3">
                                <input
                                    type="text"
                                    class="w-full rounded border-gray-900 border-solid border p-3"
                                    v-model="channel"
                                />
                            </div>
                            <div class="flex justify-end">
                                <button
                                    class="px-8 py-2 rounded bg-green-900 font-bold text-white"
                                    @click="addChannel"
                                >
                                    作成
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <PlusCircle @click.native="showChannelModal" />
            </div>
            <div
                class="opacity-50 mt-1"
                v-for="channel in channels"
                :key="channel.id"
            >
                # {{ channel.channel_name }}
            </div>
            <div class="mt-5 flex justify-between items-center">
                <div class="font-bold opacity-50 text-lg">
                    ダイレクトメッセージ
                </div>
                <PlusCircle />
            </div>
            <div
                class="mt-2 flex items-center"
                v-for="user in users"
                :key="user.user_id"
            >
                <span
                    class="rounded-full w-3 h-3 mr-2"
                    :class="[isOnline(user) ? 'bg-yellow-400' : 'bg-gray-600']"
                ></span>
                <span class="opacity-50" @click="directMessage(user)">
                    {{ user.email }}
                </span>
            </div>
        </div>
        <div class="flex-grow bg-gray-100">
            <header class="border-b">
                <div class="flex justify-between m-3">
                    <div>
                        <div class="font-bold text-lg">{{ user.email }}</div>
                        <Star />
                    </div>
                    <div class="flex items-center">
                        <Call class="mx-2" />
                        <Information />
                        <Cog class="mx-2" />
                        <div class="border w-64 rounded p-1 ml-2 mr-2 flex">
                            <Search />
                            <span class="ml-2 text-gray-700">検索</span>
                        </div>
                        <AtSymbol class="mx-2" />
                        <Star class="mx-2" />
                        <button
                            class="py-1 px-4 bg-gray-800 text-white rounded"
                            @click="signOut"
                        >
                            サインアウト
                        </button>
                    </div>
                </div>
            </header>
            <main class="h-full overflow-y-scroll">
                <div class="h-full flex flex-col ml-6">
                    <div class="flex-grow overflow-y-scroll">
                        <div class="mt-2 mb-4 flex">
                            <Avator :user="user.email" />
                            <div class="ml-2">
                                <div class="font-bold">{{ user.email }}</div>
                                <div>{{ message }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="border border-gray-900 rounded mb-4">
                        <textarea
                            class="w-full pt-4 pl-8 outline-none"
                            :placeholder="placeholder"
                            v-model="message"
                        ></textarea>
                        <div class="bg-gray-100 p-2">
                            <button
                                class="bg-green-900 text-sm text-white font-bold py-1 px-2 rounded"
                                @click="sendMessage"
                            >
                                送信
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";

import Notification from "../components/icons/Notification";
import PlusCircle from "../components/icons/PlusCircle";
import Search from "../components/icons/Search";
import Star from "../components/icons/Star";
import Cog from "../components/icons/Cog";
import Call from "../components/icons/Call";
import Information from "../components/icons/Information";
import AtSymbol from "../components/icons/AtSymbol";
import Avator from "../components/Avator";

export default {
    components: {
        Notification,
        PlusCircle,
        Search,
        Star,
        Cog,
        Call,
        Information,
        AtSymbol,
        Avator,
    },
    data() {
        return {
            user: "",
            users: [],
            message: "",
            messages: [],
            placeholder: "",
            channel_name: "",
            channel_id: "",
            channelModal: false,
            channel: "",
            channels: [],
            connectionRef: firebase.database().ref("connections"),
            connection_key: "",
            connections: [],
        };
    },
    methods: {
        signOut() {
            this.connectionRef.child(this.connection_key).remove();
            firebase.auth().signOut();
            this.$router.push("/signin");
        },
        sendMessage() {
            const newMessage = firebase
                .database()
                .ref("messages")
                .child(this.channel_id)
                .push();

            const key_id = newMessage.key;

            newMessage.set({
                key: key_id,
                content: this.message,
                user: this.user.email,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
            });

            this.message = "";
        },
        directMessage(user) {
            this.messages = [];
            this.user.uid > user.user_id
                ? (this.channel_id = this.user.uid + "-" + user.user_id)
                : (this.channel_id = user.user_id + "-" + this.user.uid);

            if (this.channel_id != "") {
                firebase
                    .database()
                    .ref("messages")
                    .child(this.channel_id)
                    .off();
            }

            firebase
                .database()
                .ref("messages")
                .child(this.channel_id)
                .on("child_added", (snapshot) => {
                    this.messages.push(snapshot.val());
                });
        },
        showChannelModal() {
            this.channelModal = true;
        },
        closeChannelModal() {
            this.channelModal = false;
        },
        addChannel() {
            const newChannel = firebase
                .database()
                .ref("channel")
                .push();

            const key_id = newChannel.key;

            newChannel
                .set({
                    channel_name: this.channel,
                    id: key_id,
                })
                .then(() => {
                    this.channelModal = false;
                });

            this.channel = "";
        },
        channelMessage(channel) {
            this.messages = [];
            this.channel_name = "# " + channel.channel_name;
            this.channel_id = channel.id;

            if (this.channel_id != "") {
                firebase
                    .database()
                    .ref("messages")
                    .child(this.channel_id)
                    .off();
            }

            firebase
                .database()
                .ref("messages")
                .child(channel.id)
                .on("child_added", (snapshot) => {
                    this.messages.push(snapshot.val());
                });
        },
        isOnline(user) {
            if (user.status === "online") {
                return true;
            } else {
                return false;
            }
        },
    },
    mounted() {
        this.user = firebase.auth().currentUser;
        firebase
            .database()
            .ref("users")
            .on("child_added", (snapshot) => {
                let user = snapshot.val();

                if (this.user.uid == user.user_id) {
                    user.status = "online";
                } else {
                    user.status = "offline";
                }
                this.users.push(user);
            });

        firebase
            .database()
            .ref("channel")
            .on("child_added", (snapshot) => {
                this.channels.push(snapshot.val());
            });

        firebase
            .database()
            .ref(".info/connected")
            .on("value", (snapshot) => {
                if (snapshot.val() === true) {
                    let ref = this.connectionRef.push();
                    this.connection_key = ref.key;
                    ref.onDisconnect().remove();

                    ref.set({
                        user_id: this.user.uid,
                        key: this.connection_key,
                    });
                }
            });

        firebase
            .database()
            .ref("connections")
            .on("child_added", (snapshot) => {
                let new_connection = snapshot.val();
                this.connections.push(new_connection);

                let user = this.users.find(
                    (user) => user.user_id === new_connection.user_id
                );

                if (user != undefined) {
                    user.status !== "online";
                }
            });

        firebase
            .database()
            .ref("connections")
            .on("child_removed", (snapshot) => {
                let remove_connection = snapshot.val();

                this.connections = this.connections.filter(
                    (connection) => connection.key !== remove_connection.key
                );

                let index = this.connections.findIndex((connection) => {
                    return connection.user_id === remove_connection.user_id;
                });

                if (index === -1) {
                    let user = this.users.find(
                        (user) => user.user_id == remove_connection.user_id
                    );
                    user.status = "offline";
                }
            });
    },
    beforeDestroy() {
        firebase
            .database()
            .ref("users")
            .off();

        firebase
            .database()
            .ref("messages")
            .child(this.channel_id)
            .off();

        firebase
            .database()
            .ref(".info/connected")
            .off();
    },
};
</script>
