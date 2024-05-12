import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../util/http.js";

import Header from "../Header.jsx";
import { deleteEvent, fetchEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data,
    isPending: isPendingEvent,
    isError: isErrorEvent,
    error: errorEvent,
  } = useQuery({
    queryKey: ["events", { id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 5000,
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: errorDeletion,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const handleDeletingEvent = () => {
    mutate({ id });
  };

  const handleOpenDeletingModal = () => {
    setIsDeleting(true);
  };

  const handleCloseDeletingModal = () => {
    setIsDeleting(false);
  };

  let content;

  if (isPendingEvent) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching...</p>
      </div>
    );
  }

  if (isErrorEvent) {
    content = (
      <div id="event-details-content" className="center">
        {" "}
        <ErrorBlock
          title="An error occurred"
          message={
            errorEvent.info?.message ||
            "An error occured when fetching the event"
          }
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            {isPendingDeletion && <p>Deleting...</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleOpenDeletingModal}>Delete</button>
                <Link to="edit">Edit</Link>
              </>
            )}
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="Detail Image" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleCloseDeletingModal}>
          <h2>Are you sure?</h2>
          <p>
            Do you realy want to delete this event? This action cannot be
            undone.
          </p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting, please await...</p>}
            {!isPendingDeletion && (
              <>
                <button
                  className="button-text"
                  onClick={handleCloseDeletingModal}
                >
                  Cancel
                </button>
                <button className="button" onClick={handleDeletingEvent}>
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeletion && (
            <ErrorBlock
              title="Failed to delete event"
              message={
                errorDeletion.info?.message ||
                "Failed to delete event. Please try again later."
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
