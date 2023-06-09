"use client";

import { pusherClient } from "@/lib/pusher";
import { cn, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { User } from "@/types/db";
import { format, isSameDay } from "date-fns";
import Image from "next/image";
import { FC, Fragment, useEffect, useRef, useState } from "react";

interface MessagesProps {
    initialMessages: Message[];
    sessionId: string;
    chatId: string;
    sessionImage: string | null | undefined;
    chatPartner: User;
}

const Messages: FC<MessagesProps> = ({
    initialMessages,
    sessionId,
    chatId,
    sessionImage,
    chatPartner,
}) => {
    const scrollDownRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>(initialMessages);

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

        const messageHandler = (message: Message) => {
            setMessages((prevMessages) => [message, ...prevMessages]);
        };

        pusherClient.bind("incoming_message", messageHandler);

        return () => {
            pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
            pusherClient.unbind("incoming_message", messageHandler);
        };
    }, []);

    const formatTimestamp = (timestamp: number) => {
        return format(timestamp, "HH:mm");
    };

    return (
        <div
            id="messages"
            className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
        >
            <div ref={scrollDownRef} />
            {messages.map((message, index) => {
                const isCurrentUser = message.senderId === sessionId;

                const hasNextMessageFromSameUser =
                    messages[index - 1]?.senderId === messages[index].senderId;

                const hasDateChanged = !isSameDay(
                    messages[index + 1]?.timestamp,
                    message.timestamp
                );

                return (
                    <Fragment key={`${message.id}-${message.timestamp}`}>
                        <div className="chat-message">
                            <div
                                className={cn("flex items-end", {
                                    "justify-end": isCurrentUser,
                                })}
                            >
                                <div
                                    className={cn(
                                        "flex flex-col space-y-2 text-base max-w-xs mx-2",
                                        {
                                            "order-1 items-end": isCurrentUser,
                                            "order-2 items-start":
                                                !isCurrentUser,
                                        }
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "px-4 py-2 rounded-lg inline-block",
                                            {
                                                "bg-indigo-600 text-white":
                                                    isCurrentUser,
                                                "bg-gray-200 text-gray-900":
                                                    !isCurrentUser,
                                                "rounded-br-none":
                                                    !hasNextMessageFromSameUser &&
                                                    isCurrentUser,
                                                "rounded-bl-none":
                                                    !hasNextMessageFromSameUser &&
                                                    !isCurrentUser,
                                            }
                                        )}
                                    >
                                        {message.text}{" "}
                                        <span className="ml-2 text-xs text-gray-400">
                                            {formatTimestamp(message.timestamp)}
                                        </span>
                                    </span>
                                </div>

                                <div
                                    className={cn("relative w-6 h-6", {
                                        "order-2": isCurrentUser,
                                        "order-1": !isCurrentUser,
                                        invisible: hasNextMessageFromSameUser,
                                    })}
                                >
                                    <Image
                                        fill
                                        src={
                                            isCurrentUser
                                                ? (sessionImage as string)
                                                : chatPartner.image
                                        }
                                        alt="Profile picture"
                                        referrerPolicy="no-referrer"
                                        className="rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                        {hasDateChanged && (
                            <div className="flex items-center w-full">
                                <span className="flex-grow bg-gray-200 rounded h-[1px]"></span>
                                <span className="mx-2 text-sm text-gray-400 font-semibold">
                                    {format(message.timestamp, "yyyy-MM-dd")}
                                </span>
                                <span className="flex-grow bg-gray-200 rounded h-[1px]"></span>
                            </div>
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
};

export default Messages;
