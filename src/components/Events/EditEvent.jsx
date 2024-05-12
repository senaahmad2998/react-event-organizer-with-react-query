import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import Modal from "../UI/Modal.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import EventForm from "./EventForm.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useNavigation();
  const submit = useSubmit();

  const {
    data,
    isPending: isPendingEvent,
    isError: isErrorEvent,
    error: errorEvent,
  } = useQuery({
    queryKey: ["events", { id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    // staleTime: 5000,
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async ({ event }) => {
  //     // onMutate will run when mutate is execute, and the params is same with params in updateEvent function
  //     await queryClient.cancelQueries({ queryKey: ["events", { id }] }); // it will cancel the request and revert the query back to its previous state
  //     const previousData = queryClient.getQueryData(["events", { id }]);

  //     queryClient.setQueryData(["events", { id }], event); // it will manipulate the query data

  //     return { previousData };
  //   },
  //   onError: (error, data, context) => {
  //     // onError will return argument error data of the query, data that mutate receive and context, the return object from onMutate
  //     queryClient.setQueryData(["events", { id }], context.previousData);
  //   },
  //   onSettled: () => {
  //     // onSettled is a function that will be run after onSuccess or onError is finish
  //     queryClient.invalidateQueries(["events", { id }]);
  //   },
  // });

  function handleSubmit(formData) {
    // mutate({ id, event: formData });
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPendingEvent) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isErrorEvent) {
    content = (
      <>
        <ErrorBlock
          title="Failed to fetch the event"
          message={
            errorEvent.info?.message ||
            "Failed to fetch the event. Try again later."
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Submitting...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
    staleTime: 10000,
  });
}

export async function action({ params, request }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries();
  return redirect("../");
}
