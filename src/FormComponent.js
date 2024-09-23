import React, { Component } from "react";
import { Formik, Field, Form, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { getData } from "country-list"; // Import country-list
import { Modal, Button } from "react-bootstrap";

// Get list of countries for Select dropdown
const countries = getData().map((country) => ({
  label: country.name,
  value: country.code,
}));

class MultiLegForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      formData: [],
    };
  }

  // Modal handling functions
  handleClose = () => this.setState({ showModal: false });
  handleShow = () => this.setState({ showModal: true });

  // Validation schema using Yup
  validationSchema = Yup.object().shape({
    legs: Yup.array()
      .of(
        Yup.object().shape({
          departureLocation: Yup.object().required("Departure Location is required"),
          arrivalLocation: Yup.object()
            .required("Arrival Location is required")
            .test("different-locations", "Arrival and Departure locations cannot be the same", function (value) {
              const { departureLocation } = this.parent;
              // Only return false if the two locations are the same
              return value && departureLocation && value.value !== departureLocation.value;
            }),
          departureDate: Yup.date().required("Departure Date is required"),
          passengers: Yup.number()
            .min(1, "At least one passenger is required")
            .required("Number of passengers is required"),
        })
      )
      .test(
        "dates-ascending",
        "Dates must be in ascending order for each leg.",
        function (legs) {
          for (let i = 1; i < legs.length; i++) {
            const currentLegDate = new Date(legs[i].departureDate);
            const previousLegDate = new Date(legs[i - 1].departureDate);
            if (currentLegDate <= previousLegDate) {
              return this.createError({
                path: `legs.${i}.departureDate`,
                message: `Leg ${i + 1} must have a later date than Leg ${i}.`,
              });
            }
          }
          return true;
        }
      ),
  });

  // Function to handle form submission
  handleSubmit = (values) => {
    this.setState({ formData: values.legs, showModal: true });
  };

  render() {
    return (
      <div className="container mt-4">
        <h2>Multi-leg Travel Form</h2>
        <Formik
          initialValues={{
            legs: [
              {
                departureLocation: null,
                arrivalLocation: null,
                departureDate: "",
                passengers: 1,
              },
            ],
          }}
          validationSchema={this.validationSchema}
          onSubmit={this.handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <FieldArray name="legs">
                {({ push, remove }) => (
                  <>
                    {values.legs.map((leg, index) => (
                      <div key={index} className="mb-4">
                        <h4>Leg {index + 1}</h4>

                        {/* Departure Location */}
                        <div className="form-group">
                          <label>Departure Location</label>
                          <Select
                            options={countries}
                            value={leg.departureLocation}
                            onChange={(val) =>
                              setFieldValue(`legs.${index}.departureLocation`, val)
                            }
                            className="form-control"
                          />
                          <ErrorMessage
                            name={`legs.${index}.departureLocation`}
                            component="div"
                            className="text-danger"
                          />
                        </div>

                        {/* Arrival Location */}
                        <div className="form-group">
                          <label>Arrival Location</label>
                          <Select
                            options={countries}
                            value={leg.arrivalLocation}
                            onChange={(val) =>
                              setFieldValue(`legs.${index}.arrivalLocation`, val)
                            }
                            className="form-control"
                          />
                          <ErrorMessage
                            name={`legs.${index}.arrivalLocation`}
                            component="div"
                            className="text-danger"
                          />
                        </div>

                        {/* Departure Date */}
                        <div className="form-group">
                          <label>Departure Date</label>
                          <Field
                            type="date"
                            name={`legs.${index}.departureDate`}
                            className="form-control"
                          />
                          <ErrorMessage
                            name={`legs.${index}.departureDate`}
                            component="div"
                            className="text-danger"
                          />
                        </div>

                        {/* Number of Passengers */}
                        <div className="form-group">
                          <label>Number of Passengers</label>
                          <Field
                            type="number"
                            name={`legs.${index}.passengers`}
                            className="form-control"
                          />
                          <ErrorMessage
                            name={`legs.${index}.passengers`}
                            component="div"
                            className="text-danger"
                          />
                        </div>

                        {/* Remove Leg Button */}
                        {index > 0 && (
                          <button
                            type="button"
                            className="btn btn-danger mb-3"
                            onClick={() => remove(index)}
                          >
                            Remove Leg
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add Leg Button */}
                    {values.legs.length < 5 && (
                      <button
                        type="button"
                        className="btn btn-primary mb-3"
                        onClick={() =>
                          push({
                            departureLocation: null,
                            arrivalLocation: null,
                            departureDate: "",
                            passengers: 1,
                          })
                        }
                      >
                        Add Leg
                      </button>
                    )}
                  </>
                )}
              </FieldArray>

              {/* Submit Button */}
              <button type="submit" className="btn btn-success">
                Submit
              </button>
            </Form>
          )}
        </Formik>

        {/* Modal to show form data */}
        <Modal show={this.state.showModal} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Submitted Data</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.formData.map((leg, index) => (
              <div key={index}>
                <h5>Leg {index + 1}</h5>
                <p>Departure: {leg.departureLocation ? leg.departureLocation.label : "N/A"}</p>
                <p>Arrival: {leg.arrivalLocation ? leg.arrivalLocation.label : "N/A"}</p>
                <p>Date: {leg.departureDate}</p>
                <p>Passengers: {leg.passengers}</p>
                <hr />
              </div>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default MultiLegForm;