import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import "./App.css";
import DatePicker from "react-datepicker";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
import "react-datepicker/dist/react-datepicker.css";
import { CirclePicker } from "react-color";
import calendar from "./assets/calendar.svg";
import cancel from "./assets/cancel.svg";
import clock from "./assets/clock.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, FormGroup, Input, Modal } from "reactstrap";
let evtId = 0;
class App extends React.Component {
  constructor(props) {
    super();
    this.state = {
      currentEvents: [],
      open: false,
      openEdit: false,
      name: "",
      date: new Date(),
      time: moment().hour(0).minute(0),
      note: "",
      evt: {
        title: "",
        start: "",
        extendedProps: {
          description: "",
        },
      },
      background: "",
    };

    this.calendarRef = React.createRef();
  }

  toggle = () => {
    const { open } = this.state;
    this.setState({ open: !open });
  };

  handleChange = (name) => (e) => {
    this.setState({
      [name]: e.target.value,
    });
  };

  handleEventClick = ({ event }) => {
    this.toggleEdit();
    this.setState({ date: "", name: "" });
    this.setState({
      eventId: event.id,
      event: event,
      evt: event,
      note: event.extendedProps.description,
      background: event.backgroundColor,
    });
  };

  toggleEdit = () => {
    const { openEdit } = this.state;
    this.setState({ openEdit: !openEdit });
  };

  handleSelect = () => {
    this.setState({ name: "", date: "", time: "", note: "" });
    this.toggle();
  };

  handleCreate = () => {
    const { date, time, name, background, note } = this.state;
    let newdate = new Date(moment(date).format("MM/DD/YYYY") + " " + time);
    let calendarApi = this.calendarRef.current.getApi().view.calendar;
    calendarApi.unselect();
    if (!name || !date || !time) {
      toast.error("Please, fill in required field");
      return;
    }
    if (name.length > 30) {
      toast.error("You have reached your maximum limit of characters allowed");
      return;
    } else {
      let newObject = {
        title: name,
        start: newdate,
        end: this.calendarRef.current.getApi().endStr,
        id: evtId++,
        backgroundColor: background,
        textColor: "#ffffff",
        description: note,
      };
      this.setState((prevState) => ({
        currentEvents: [...prevState.currentEvents, newObject],
      }));
      toast.success("🦄Event has been created!");
    }

    this.toggle();
  };

  handleEdit = () => {
    const {
      date,
      time,
      evt,
      currentEvents,
      event,
      name,
      eventId,
      background,
      note,
    } = this.state;
    let newdate = date
      ? new Date(moment(date).format("MM/DD/YYYY") + " " + time)
      : new Date(moment(evt.start).format("MM/DD/YYYY") + " " + time);

    let newEvents = currentEvents.map((prop, key) => {
      if (prop.id + "" === eventId + "") {
        if (newdate) {
          event.remove();
          if (evt.extendedProps) {
            this.setState({
              note: evt.extendedProps.description,
            });
          }
          return {
            ...prop,
            title: name ? name : evt.title,
            start: newdate,
            backgroundColor: background,
            description: note,
          };
        }
      } else {
        return prop;
      }
    });
    this.setState({
      currentEvents: newEvents,
      eventId: undefined,
      event: undefined,
    });
    toast.success("🦄Event has been updated!", { className: "update-alert" });
    this.toggleEdit();
  };

  handleRemove = () => {
    const { currentEvents, event, eventId } = this.state;
    var newEvents = currentEvents.filter((prop) => prop.id + "" !== eventId);
    event.remove();
    this.setState({
      currentEvents: newEvents,
      eventId: undefined,
      event: undefined,
    });

    toast.success("🦄Event has been deleted!", { className: "deleted-alert" });
    this.toggleEdit();
  };

  handleChangeComplete = (color) => {
    this.setState({ background: color.hex });
  };

  handlePrevClick = () => {
    this.calendarRef.current &&
      this.calendarRef.current.getApi().view.calendar.prev();
  };
  handleNextClick = () => {
    this.calendarRef.current &&
      this.calendarRef.current.getApi().view.calendar.next();
  };

  onChangeDate = (date) => {
    this.setState({ date: date });
  };
  onChangeTime = (value) => {
    this.setState({ time: value && value.format("HH:mm:ss") });
  };

  handleEditChange = (e) => {
    const { evt } = this.state;
    this.setState({
      evt: {
        title: "",
        start: evt.start,
        extendedProps: {
          description: evt.extendedProps.description,
        },
      },
      name: e.target.value,
    });
  };

  render() {
    const {
      currentEvents,
      open,
      background,
      date,
      name,
      note,
      openEdit,
      evt,
    } = this.state;
    return (
      <div className="App">
        <FullCalendar
          ref={this.calendarRef}
          headerToolbar={{
            start: "today,backButton,nextButton",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          customButtons={{
            backButton: {
              text: "Back",
              click: this.handlePrevClick,
            },
            nextButton: {
              text: "Next",
              click: this.handleNextClick,
            },
          }}
          defaultView="dayGridMonth"
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            resourceTimelinePlugin,
            listPlugin,
          ]}
          select={this.handleSelect}
          editable={true}
          droppable={true}
          selectable
          events={currentEvents}
          eventClick={this.handleEventClick}
        />
        {open && (
          <ModalCreate
            open={open}
            onChangeDate={this.onChangeDate}
            onChangeTime={this.onChangeTime}
            color={background}
            handleChangeComplete={this.handleChangeComplete}
            date={date}
            name={name}
            handleChange={this.handleChange}
            submit={this.handleCreate}
            toggle={this.toggle}
            note={note}
          ></ModalCreate>
        )}

        {openEdit && (
          <ModalUpdate
            openEdit={openEdit}
            toggleEdit={this.toggleEdit}
            handleEditChange={this.handleEditChange}
            name={name}
            title={evt.title}
            date={date}
            start={evt.start}
            color={background}
            extendedProps={evt.extendedProps}
            handleRemove={this.handleRemove}
            handleEdit={this.handleEdit}
            handleChange={this.handleChange}
            handleChangeComplete={this.handleChangeComplete}
            onChangeDate={this.onChangeDate}
            onChangeTime={this.onChangeTime}
            note={note}
          ></ModalUpdate>
        )}
        <ToastContainer />
      </div>
    );
  }
}

function ModalCreate(props) {
  return (
    <>
      <Modal isOpen={props.open} className="content">
        <div className="modal-body">
          <form className="new-event--form">
            <FormGroup>
              <Button onClick={props.toggle}>
                <img src={cancel} alt="cancel icon" />
              </Button>
              <Input
                className="input"
                placeholder="event name"
                type="text"
                onChange={props.handleChange("name")}
                value={props.name}
              />
            </FormGroup>
            <FormGroup>
              <img src={calendar} className="icon" alt="calendar icon" />
              <DatePicker
                placeholderText="event date"
                selected={props.date}
                onChange={props.onChangeDate}
                minDate={moment().toDate()}
              />
            </FormGroup>
            <FormGroup>
              <img src={clock} className="icon" alt="clock icon" />
              <TimePicker
                showSecond={false}
                placeholder="event time"
                className="xxx"
                onChange={props.onChangeTime}
                format="h:mm a"
                use12Hours
                inputReadOnly
              />
            </FormGroup>
            <FormGroup>
              <Input
                onChange={props.handleChange("note")}
                value={props.note}
                className="input"
                placeholder="notes"
              ></Input>
            </FormGroup>
            <FormGroup>
              <CirclePicker
                color={props.color}
                onChangeComplete={props.handleChangeComplete}
              />
            </FormGroup>
          </form>
        </div>
        <div className="modal-footer">
          <Button
            id="btn-cancel"
            className="ml-auto"
            color="link"
            type="button"
            onClick={props.toggle}
          >
            Cancel
          </Button>
          <Button
            className="new-event--add"
            color="primary"
            type="button"
            onClick={props.submit}
          >
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}

function ModalUpdate(props) {
  return (
    <>
      <Modal isOpen={props.openEdit} className="content">
        <div className="modal-body">
          <form className="new-event--form">
            <FormGroup>
              <Button onClick={props.toggleEdit}>
                <img src={cancel} alt="cancel icon" />
              </Button>
              <Input
                className="input"
                placeholder="event name"
                type="text"
                onChange={props.handleEditChange}
                value={props.title || props.name}
              />
            </FormGroup>
            <FormGroup>
              <img src={calendar} className="icon" alt="calendar icon" />
              <DatePicker
                placeholderText={moment(props.start).format("MM/DD/YYYY")}
                selected={props.date}
                onChange={props.onChangeDate}
                minDate={moment().toDate()}
              />
            </FormGroup>
            <FormGroup>
              <img src={clock} className="icon" alt="clock icon" />
              <TimePicker
                showSecond={false}
                placeholder={moment(props.start).format("h:mm a")}
                className="xxx"
                onChange={props.onChangeTime}
                format="h:mm a"
                use12Hours
                inputReadOnly
              />
            </FormGroup>
            <FormGroup>
              <Input
                onChange={props.handleChange("note")}
                className="input"
                placeholder={
                  props.extendedProps && props.extendedProps.description
                }
              ></Input>
            </FormGroup>
            <FormGroup>
              <CirclePicker
                color={props.color}
                onChangeComplete={props.handleChangeComplete}
              />
            </FormGroup>
          </form>
        </div>
        <div className="modal-footer">
          <Button
            id="btn-discard"
            className="ml-auto"
            color="link"
            type="button"
            onClick={props.handleRemove}
          >
            Discard
          </Button>
          <Button
            className="new-event--add"
            color="primary"
            type="button"
            onClick={props.handleEdit}
          >
            Edit
          </Button>
        </div>
      </Modal>
    </>
  );
}
export default App;
