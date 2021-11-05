import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components';

const Title = styled.h2`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
`;

const SecretTable = styled.table`
  width: 100%;
  border: 1px solid #ddd;
`;

const HeaderCell = styled.th`
  border-bottom: 1px solid #aaa;
  text-align: left;
  padding: 10px;
`;

const DataCell = styled.td`
  border-bottom: 1px solid #aaa;
  padding: 10px;
`;

const ActionCell = styled.td`
  border-bottom: 1px solid #aaa;
`;

async function retrieveList(client) {
  const tenant = client.context.account.full_domain;
  const response = await new Promise((resolve, reject) => {
    client.request.invoke('restDbQuery', { method: 'GET', tenant })
      .then(data => resolve(data.response))
      .catch(reject);
  });
  return response;
}

async function deleteList(client, dbId) {
  const response = await new Promise((resolve, reject) => {
  client.request.invoke('restDbQuery', { method: 'DELETE', dbId })
    .then(data => resolve(data.response))
    .catch(reject);
  });
  return response;
}

async function confirmDelete(client, dbId, yopassId) {
  return client.interface.trigger("showConfirm", {
    title: "Delete Record",
    message: `Are you sure you want to delete this secret (${yopassId}) from this list?`,
    saveLabel: "Confirm",
  })
    .then(async ({ message }) => {
      if (message === "Confirm")
        return await deleteList(client, dbId);
    })
    .catch(err => console.error(err));
}

const ListingPage = (props) => {
  const { client } = props;
  const tenant = client.context.account.full_domain;
  const [secretList, setSecretList] = useState([]);
  const [reload, setReload] = useState(true);

  useEffect(async () => {
    if (reload === false)
      return;

    const list = await retrieveList(client);
    setSecretList(list);
    setReload(false);
  }, [reload]);

  const expiredAt = (createdAt, expiration) => {
    const date = new Date(createdAt);
    date.setSeconds(date.getSeconds() + expiration);
    return date.toISOString();
  };

  return (
    <React.Fragment>
      <Title>Secret Messsage</Title>
      <SecretTable>
        <thead>
          <tr>
            <HeaderCell scope="col">Secret's Link</HeaderCell>
            <HeaderCell scope="col">Ticket Id</HeaderCell>
            <HeaderCell scope="col">Created By</HeaderCell>
            <HeaderCell scope="col">Created At</HeaderCell>
            <HeaderCell scope="col">Expired At</HeaderCell>
            <HeaderCell scope="col"></HeaderCell>
          </tr>
        </thead>
        <tbody>
          {secretList.map(({ _id, yopassId, ticketId, createdBy, createdAt, expiration }) =>
            <tr key={yopassId}>
              <DataCell><a href={`https://yopass.se/#/s/${yopassId}`}>{yopassId}</a></DataCell>
              <DataCell><a href={`https://${tenant}/a/tickets/${ticketId}`}>TicketId: {ticketId}</a></DataCell>
              <DataCell>{createdBy}</DataCell>
              <DataCell>{createdAt}</DataCell>
              <DataCell>{expiredAt(createdAt, expiration)}</DataCell>
              <ActionCell>
                <fw-button size="icon" color="danger" onClick={() =>
                  confirmDelete(client, _id, yopassId)
                  .then(() => setReload(true))
                  }>
                  <fw-icon name="delete" color="white"></fw-icon>
                </fw-button>
              </ActionCell>
            </tr>
          )}
        </tbody>
      </SecretTable>
    </React.Fragment>
  );
}

ListingPage.propTypes = {
  client: PropTypes.object
}
export default ListingPage
