export async function graphqlTemplate(query, variables = {}) {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        throw new Error('Authentication failed. Please log in first.');
    }
    const res = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                query,
                variables
            })
        }
    );

    const data = await res.json();
    if (data.errors) {
        throw new Error(data.errors[0].message);
    }

    return data.data;
}


export function getUserID() {
    const idQuery = `
  query {
      user {
          id
      }
  }`

    return graphqlTemplate(idQuery);
}

export async function getUserProfile() {
    const res = await getUserID();

    const userID = res.user[0].id;

    const query = `
        query GetUserProfile($userID: Int!) {
            user(where: { id: { _eq: $userID } }) {
                id
                email
                attrs
                auditRatio
                login
                profile
                totalUp
                totalDown
                totalUpBonus
            }
        }
    `;

    return graphqlTemplate(query, {
        userID: userID
    });
}

export async function queryXPAndAudits() {

    const userResult = await getUserID();

    if (
        !userResult ||
        !userResult.user ||
        !userResult.user[0]
    ) {
        throw new Error("Could not get user ID");
    }

    const userID = userResult.user[0].id;

    const query = `
        query GetXPAndAudits($userID: Int!) {

            xp_view(
                where: {
                    userId: {
                        _eq: $userID
                    }
                }
            ) {
                amount
                path
                originEventId
                userId

                event {
                    id
                    createdAt
                    startAt
                    endAt
                }
            }

            user(
                where: {
                    id: {
                        _eq: $userID
                    }
                }
            ) {
                audits {
                    id
                    auditedAt
                    auditorId
                    auditorLogin
                    closedAt
                    closureMessage
                    closureType
                    createdAt
                    endAt
                    grade
                    groupId
                    resultId
                    updatedAt
                    version

                    result {
                        id
                        path
                        grade
                    }
                }
            }
        }
    `;

    const result = await graphqlTemplate(
        query,
        {
            userID
        }
    );

    if (!result) {
        throw new Error("GraphQL query failed");
    }

    return result;
}

// Get user information
export async function getUserInfo() {
    const query = `
        query {
            user {
                id
                login
                email
                attrs
            }
        }
    `;

    return await graphqlTemplate(query);
}

// Get XP transactions
export async function getXPTransactions(userId) {
    const query = `
        query($userId: Int!) {
            transaction(
                where: {
                    type: { _eq: "xp" }
                    userId: { _eq: $userId }
                }
                order_by: { createdAt: asc }
            ) {
                id
                amount
                createdAt
                path
                object {
                    name
                }
            }
        }
    `;

    return await graphqlTemplate(query, { userId });
}

export async function getAllAudits() {
    try {
        const query = `
            query {
                audit {
                    id
                    createdAt
                    updatedAt
                    endAt
                    grade
                    groupId
                    resultId
                }
            }
        `;

        const response =
            await graphqlTemplate(query);

        console.log(
            "AUDIT RESPONSE:",
            response
        );

        return response?.audit ?? [];

    } catch (error) {
        console.error(
            "Failed to fetch audits:",
            error
        );

        return [];
    }
}

export async function getAllResults() {
    try {
        const query = `
            query {
                result {
                    id
                    objectId
                    grade
                    type
                    groupId
                    path
                    version
                    eventId
                    isLast
                    campus
                }
            }
        `;

        const response =
            await graphqlTemplate(query);

        console.log(
            "RESULT RESPONSE:",
            response
        );

        return response?.result ?? [];

    } catch (error) {
        console.error(
            "Failed to fetch results:",
            error
        );

        return [];
    }
}

export async function getGroupMembers(groupId) {
    const query = `
        query GetGroupMembers($groupId: Int!) {
            group(where: { id: { _eq: $groupId } }) {
                members {
                    user {
                        login
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch(
            "https://learn.reboot01.com/api/graphql-engine/v1/graphql",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        groupId
                    }
                })
            }
        );

        const result = await response.json();

        if (result.errors) {
            console.error("GraphQL error:", result.errors);
            return [];
        }

        return result.data.group.flatMap(group =>
            group.members.map(member => member.user.login)
        );

    } catch (error) {
        console.error("Failed to fetch group members:", error);
        return [];
    }
}

export async function getSkillTransactions() {

    const query = `
        query {
            transaction(
                where: {
                    type: {
                        _like: "skill_%"
                    }
                }
                order_by: {
                    createdAt: desc
                }
            ) {
                id
                type
                amount
                path
                createdAt
            }
        }
    `;

    const response =
        await graphqlTemplate(query);

    return response?.transaction ?? [];
}