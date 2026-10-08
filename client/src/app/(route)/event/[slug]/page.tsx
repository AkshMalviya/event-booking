import EventDetails from "@/components/event-details/EventDetails";
import { EventBySlugDocument } from "@/generated/graphql";
import { apolloClient } from "@/lib/apolloClient";

export default async function EventDetailsPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const slug = (await params).slug || "";
  const { data, error } = await apolloClient.query({
    query: EventBySlugDocument,
    variables: { slug },
  });

  return <EventDetails event={data?.event} error={error} />;
}
