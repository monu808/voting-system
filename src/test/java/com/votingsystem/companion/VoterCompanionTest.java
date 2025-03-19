package com.votingsystem.companion;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import android.content.Context;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.json.JSONObject;

@RunWith(MockitoJUnitRunner.class)
public class VoterCompanionTest {

    @Mock
    private Context mockContext;

    @Mock
    private VoterApiClient mockApiClient;

    @Mock
    private SecureStorage mockStorage;

    private MainActivity mainActivity;

    @Before
    public void setUp() {
        mainActivity = new MainActivity();
        mainActivity.apiClient = mockApiClient;
        mainActivity.secureStorage = mockStorage;
    }

    @Test
    public void testPreVerificationTokenGeneration() throws Exception {
        // Setup mock responses
        String testVoterId = "voter123";
        String testToken = "test-token-12345";

        JSONObject tokenResponse = new JSONObject();
        tokenResponse.put("token", testToken);

        when(mockStorage.getVoterId()).thenReturn(testVoterId);
        when(mockApiClient.requestPreVerificationToken(testVoterId)).thenReturn(tokenResponse);

        // Call the method
        mainActivity.generatePreVerificationToken();

        // Verify interactions
        verify(mockStorage).getVoterId();
        verify(mockApiClient).requestPreVerificationToken(testVoterId);
        verify(mockStorage).storeToken(testToken);
        verify(mockApiClient).updateVoterStatus(testVoterId, "PRE_VERIFIED");
    }

    @Test
    public void testHandlesMissingVoterId() throws Exception {
        // Setup mock to return null voter ID
        when(mockStorage.getVoterId()).thenReturn(null);

        // Call the method
        mainActivity.generatePreVerificationToken();

        // Verify no token was requested
        verify(mockApiClient, never()).requestPreVerificationToken(anyString());
    }
}